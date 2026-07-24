import React, { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, addDoc, doc, deleteDoc, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { ResumeDocument } from '../types';
import {
  extractTextFromFile,
  cleanAndNormalizeText,
  extractSkillsFromText,
  extractCandidateMetadata
} from '../lib/resumeProcessor';
import {
  UploadCloud,
  FileText,
  Search,
  Trash2,
  Eye,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  Sparkles,
  Filter
} from 'lucide-react';

export const ResumesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [resumes, setResumes] = useState<ResumeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('All');

  // Upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View modal state
  const [viewResume, setViewResume] = useState<ResumeDocument | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'resumes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: ResumeDocument[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as ResumeDocument);
      });
      // Sort by uploadedAt desc
      items.sort((a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime());
      setResumes(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Upload & Process Pipeline
  const handleFileUpload = async (file: File) => {
    if (!currentUser) return;
    const validTypes = ['pdf', 'docx', 'doc', 'txt'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validTypes.includes(ext)) {
      setUploadError('Invalid file format. Only PDF, DOCX, and TXT files are supported.');
      return;
    }

    try {
      setUploadError(null);
      setUploading(true);

      // Step 1: Upload to Firebase Storage
      setUploadProgress('Uploading document to Firebase Storage...');
      const storagePath = `resumes/${currentUser.uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);

      let fileUrl = '';
      try {
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
      } catch (stErr) {
        console.warn('Firebase Storage direct upload fallback to Data URL:', stErr);
        // Fallback to data URL for high resilience
        fileUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string || '');
          reader.readAsDataURL(file);
        });
      }

      // Step 2: Extract Text
      setUploadProgress('Extracting candidate text from document...');
      const rawText = await extractTextFromFile(file);

      // Step 3: Clean & Normalize Text
      setUploadProgress('Cleaning & normalizing NLP text tokens...');
      const cleanText = cleanAndNormalizeText(rawText);

      // Step 4: Extract Metadata & Skills
      setUploadProgress('Extracting candidate skills taxonomy...');
      const { candidateName, email, phone, totalExperienceYears } = extractCandidateMetadata(rawText, file.name);
      const skills = extractSkillsFromText(rawText);

      // Step 5: Save Document to Firestore
      setUploadProgress('Saving resume record to Firestore...');
      const summary = `${candidateName} - ${totalExperienceYears} years experience with expertise in ${skills.slice(0, 5).join(', ')}.`;

      await addDoc(collection(db, 'resumes'), {
        uid: currentUser.uid,
        candidateName,
        email,
        phone,
        filename: file.name,
        fileUrl,
        storagePath,
        fileType: ext.toUpperCase(),
        fileSize: file.size,
        rawText,
        cleanText,
        skills,
        totalExperienceYears,
        summary,
        uploadedAt: new Date().toISOString(),
        status: 'Parsed'
      });

      setUploadProgress('Resume successfully parsed and indexed!');
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (err: any) {
      console.error('Error processing resume upload:', err);
      setUploadError(err.message || 'Failed to process resume upload.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteResume = async (resume: ResumeDocument) => {
    if (window.confirm(`Are you sure you want to delete ${resume.candidateName}'s resume?`)) {
      try {
        // Delete Firestore document
        await deleteDoc(doc(db, 'resumes', resume.id));

        // Delete Firebase Storage file if path exists
        if (resume.storagePath) {
          try {
            const fileRef = ref(storage, resume.storagePath);
            await deleteObject(fileRef);
          } catch (stErr) {
            console.warn('Storage file deletion notice:', stErr);
          }
        }
      } catch (err) {
        console.error('Error deleting resume:', err);
      }
    }
  };

  // Collect all unique skills for filter list
  const allSkills = Array.from(new Set(resumes.flatMap(r => r.skills))).slice(0, 15);

  // Filtered Resumes
  const filteredResumes = resumes.filter((r) => {
    const matchesSearch = r.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSkill = selectedSkillFilter === 'All' || r.skills.some(s => s.toLowerCase() === selectedSkillFilter.toLowerCase());
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Candidate Resume Vault</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Upload PDF/DOCX resumes to extract skills, contact metadata, and text vectors for AI job matching
        </p>
      </div>

      {/* Upload Drag & Drop Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-[#262a3d] bg-[#0d0e15] hover:border-indigo-500/50 hover:bg-[#12141f]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-white mb-1">
          Drag & Drop candidate resumes here, or <span className="text-indigo-400 underline">browse files</span>
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Supports PDF, DOCX, and TXT files up to 15MB. Automated NLP skill extraction triggers upon upload.
        </p>

        {uploading && (
          <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl max-w-md mx-auto text-xs text-indigo-300 flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
            <span>{uploadProgress}</span>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl max-w-md mx-auto text-xs text-red-400 flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sophisticated-card p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate name, filename, or skill tag..."
            className="w-full pl-11 pr-4 py-2 bg-[#08090e] border border-[#202436] rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {allSkills.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-500 font-medium shrink-0">Skill:</span>
            <button
              onClick={() => setSelectedSkillFilter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                selectedSkillFilter === 'All'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {allSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkillFilter(skill)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                  selectedSkillFilter === skill
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Resumes List Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
          <p className="text-sm">Retrieving resume collection from Firestore...</p>
        </div>
      ) : filteredResumes.length === 0 ? (
        <div className="sophisticated-card rounded-2xl p-12 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <h3 className="text-base font-bold text-white">No candidate resumes found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload PDF or DOCX candidate resumes using the box above to build your talent pool.
          </p>
        </div>
      ) : (
        <div className="sophisticated-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Extracted Skills</th>
                  <th className="px-6 py-4">Experience</th>
                  <th className="px-6 py-4">File</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredResumes.map((resume) => (
                  <tr key={resume.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-600/20 text-indigo-300 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                          {resume.candidateName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{resume.candidateName}</p>
                          <p className="text-xs text-slate-500">Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      <p className="flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{resume.email}</span>
                      </p>
                      <p className="flex items-center space-x-1 mt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{resume.phone}</span>
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {resume.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {resume.skills.length > 4 && (
                          <span className="text-[11px] text-slate-500 font-medium self-center">
                            +{resume.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs font-semibold text-slate-200">
                      {resume.totalExperienceYears} Years
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      <span className="font-medium text-slate-300 truncate max-w-[120px] block">
                        {resume.filename}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">{resume.fileType}</span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setViewResume(resume)}
                          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                          title="View Candidate Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteResume(resume)}
                          className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                          title="Delete Resume"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidate Resume View Modal */}
      {viewResume && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
                  {viewResume.candidateName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{viewResume.candidateName}</h3>
                  <p className="text-xs text-slate-400">{viewResume.email} • {viewResume.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setViewResume(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <div>
                  <p className="text-slate-500 uppercase font-semibold">Experience</p>
                  <p className="text-white font-bold text-sm mt-0.5">{viewResume.totalExperienceYears} Years</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase font-semibold">File Format</p>
                  <p className="text-white font-bold text-sm mt-0.5">{viewResume.fileType}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase font-semibold">Skills Count</p>
                  <p className="text-white font-bold text-sm mt-0.5">{viewResume.skills.length} Extracted</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Extracted Skills Taxonomy</h4>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-3 bg-slate-950 rounded-xl border border-slate-800">
                  {viewResume.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Extracted NLP Document Text</h4>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 max-h-60 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {viewResume.rawText}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <a
                  href={viewResume.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition"
                >
                  Download Original File ({viewResume.filename})
                </a>
                <button
                  onClick={() => setViewResume(null)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumesPage;
