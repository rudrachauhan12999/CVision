import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Job } from '../types';
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Clock,
  DollarSign,
  Trash2,
  Edit3,
  X,
  Check,
  Building,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const JobsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote');
  const [type, setType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote'>('Full-time');
  const [description, setDescription] = useState('');
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredSkillsInput, setPreferredSkillsInput] = useState('');
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [minExperienceYears, setMinExperienceYears] = useState<number>(3);
  const [salaryRange, setSalaryRange] = useState('$120,000 - $150,000');
  const [status, setStatus] = useState<'Active' | 'Draft' | 'Closed'>('Active');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'jobs'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Job[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Job);
      });
      // sort by createdAt desc
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setJobs(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const openCreateModal = () => {
    setEditingJob(null);
    setTitle('');
    setDepartment('Engineering');
    setLocation('Remote / Onsite');
    setType('Full-time');
    setDescription('');
    setRequiredSkills(['React', 'TypeScript', 'Node.js']);
    setPreferredSkills(['GraphQL', 'Docker']);
    setMinExperienceYears(3);
    setSalaryRange('$120,000 - $160,000');
    setStatus('Active');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setDepartment(job.department || 'Engineering');
    setLocation(job.location || 'Remote');
    setType(job.type || 'Full-time');
    setDescription(job.description || '');
    setRequiredSkills(job.requiredSkills || []);
    setPreferredSkills(job.preferredSkills || []);
    setMinExperienceYears(job.minExperienceYears || 0);
    setSalaryRange(job.salaryRange || '');
    setStatus(job.status || 'Active');
    setFormError(null);
    setModalOpen(true);
  };

  const handleAddRequiredSkill = () => {
    if (requiredSkillsInput.trim() && !requiredSkills.includes(requiredSkillsInput.trim())) {
      setRequiredSkills([...requiredSkills, requiredSkillsInput.trim()]);
      setRequiredSkillsInput('');
    }
  };

  const handleRemoveRequiredSkill = (skillToRemove: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skillToRemove));
  };

  const handleAddPreferredSkill = () => {
    if (preferredSkillsInput.trim() && !preferredSkills.includes(preferredSkillsInput.trim())) {
      setPreferredSkills([...preferredSkills, preferredSkillsInput.trim()]);
      setPreferredSkillsInput('');
    }
  };

  const handleRemovePreferredSkill = (skillToRemove: string) => {
    setPreferredSkills(preferredSkills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || requiredSkills.length === 0 || !description) {
      setFormError('Job Title, Description, and at least one Required Skill are mandatory.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const jobData = {
        title,
        department,
        location,
        type,
        description,
        requiredSkills,
        preferredSkills,
        minExperienceYears: Number(minExperienceYears),
        salaryRange,
        status,
        updatedAt: new Date().toISOString()
      };

      if (editingJob) {
        await updateDoc(doc(db, 'jobs', editingJob.id), jobData);
      } else {
        await addDoc(collection(db, 'jobs'), {
          ...jobData,
          createdBy: currentUser?.uid || '',
          createdAt: new Date().toISOString()
        });
      }

      setModalOpen(false);
    } catch (err: any) {
      console.error('Error saving job:', err);
      setFormError(err.message || 'Failed to save job opening.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job opening?')) {
      try {
        await deleteDoc(doc(db, 'jobs', jobId));
      } catch (err) {
        console.error('Error deleting job:', err);
      }
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requiredSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'All' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Job Openings Repository</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage active job descriptions for automated candidate resume matching
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Post New Job Opening</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sophisticated-card p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, department, or required skills..."
            className="w-full pl-11 pr-4 py-2 bg-[#08090e] border border-[#202436] rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['All', 'Active', 'Draft', 'Closed'].map((statusOption) => (
            <button
              key={statusOption}
              onClick={() => setFilterStatus(statusOption)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === statusOption
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-[#181a26] text-slate-400 hover:text-white hover:bg-[#202436]'
              }`}
            >
              {statusOption}
            </button>
          ))}
        </div>
      </div>

      {/* Job Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
          <p className="text-sm">Loading job openings from Firestore...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="sophisticated-card rounded-2xl p-12 text-center text-slate-400">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <h3 className="text-base font-bold text-white">No job openings found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Create your first job listing to start running AI candidate match evaluations.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition"
          >
            Create Job Opening
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="sophisticated-card rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-2 ${
                        job.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        job.status === 'Draft' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}
                    >
                      {job.status}
                    </span>
                    <h3 className="text-lg font-bold text-white">{job.title}</h3>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(job)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                      title="Edit job"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                      title="Delete job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.department}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.minExperienceYears}+ yrs exp</span>
                  </div>
                  {job.salaryRange && (
                    <div className="flex items-center space-x-1 text-emerald-400 font-medium">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{job.salaryRange}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                  {job.description}
                </p>

                {/* Required Skills Tags */}
                <div className="mb-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Created {new Date(job.createdAt || Date.now()).toLocaleDateString()}</span>
                <span className="font-semibold text-indigo-400">
                  {job.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Job Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <h3 className="text-lg font-bold text-white">
                {editingJob ? 'Edit Job Opening' : 'Post New Job Opening'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Engineering, Product, Data..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Job Type
                  </label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Min Experience (Yrs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={minExperienceYears}
                    onChange={(e) => setMinExperienceYears(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA or Remote"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="$120k - $150k"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Required Core Skills (Tags) *
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={requiredSkillsInput}
                    onChange={(e) => setRequiredSkillsInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRequiredSkill(); } }}
                    placeholder="e.g. React, Python, PostgreSQL..."
                    className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddRequiredSkill}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequiredSkill(skill)}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Job Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of responsibilities, requirements, and tech stack..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingJob ? 'Save Changes' : 'Post Job Opening'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
