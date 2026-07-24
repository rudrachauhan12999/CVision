import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Job, ResumeDocument, AnalysisResult } from '../types';
import { analyzeResumeForJob } from '../lib/resumeProcessor';
import {
  Sparkles,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  BarChart3,
  Check,
  X,
  Plus,
  RefreshCw,
  Award,
  Zap,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export const AnalyzePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<ResumeDocument[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Selection state
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');

  // Processing state
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [analysisOutput, setAnalysisOutput] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const steps = [
    'Extract Text',
    'Clean Text',
    'Normalize Tokens',
    'Extract Skills',
    'Generate TF-IDF Vector',
    'Calculate Cosine Similarity',
    'Calculate Match Score',
    'Determine Recommendation',
    'Store Analysis in Firestore'
  ];

  useEffect(() => {
    if (!currentUser) return;

    // Fetch jobs
    const unsubJobs = onSnapshot(query(collection(db, 'jobs')), (snapshot) => {
      const items: Job[] = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() } as Job));
      setJobs(items);
      if (items.length > 0 && !selectedJobId) {
        setSelectedJobId(items[0].id);
      }
    });

    // Fetch resumes
    const unsubResumes = onSnapshot(query(collection(db, 'resumes')), (snapshot) => {
      const items: ResumeDocument[] = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() } as ResumeDocument));
      setResumes(items);
      if (items.length > 0 && !selectedResumeId) {
        setSelectedResumeId(items[0].id);
      }
      setLoadingData(false);
    });

    return () => {
      unsubJobs();
      unsubResumes();
    };
  }, [currentUser]);

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const selectedResume = resumes.find(r => r.id === selectedResumeId);

  // Run AI Matching Pipeline
  const runAnalysisPipeline = async () => {
    if (!selectedJob || !selectedResume || !currentUser) {
      setErrorMsg('Please select both a Job Opening and a Candidate Resume.');
      return;
    }

    try {
      setErrorMsg(null);
      setAnalyzing(true);
      setAnalysisOutput(null);

      // Step-by-step progress simulation for realistic execution feedback
      for (let i = 0; i < steps.length - 1; i++) {
        setCurrentStep(i);
        await new Promise((r) => setTimeout(r, 220));
      }

      // Execute AI matching algorithms
      setCurrentStep(steps.length - 1);
      const resultData = analyzeResumeForJob(
        selectedResume.rawText,
        selectedResume.skills,
        selectedResume.totalExperienceYears,
        selectedResume.candidateName,
        selectedJob,
        selectedResume.id,
        currentUser.uid
      );

      // Save analysis record in Firestore
      const docRef = await addDoc(collection(db, 'analysis'), resultData);

      const completeResult: AnalysisResult = {
        id: docRef.id,
        ...resultData
      };

      setAnalysisOutput(completeResult);
    } catch (err: any) {
      console.error('Error during AI analysis pipeline:', err);
      setErrorMsg(err.message || 'Failed to complete resume analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">CVision Match Analysis Engine</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Execute TF-IDF vector similarity, skill gap evaluation, and experience index calculations
        </p>
      </div>

      {/* Selector Inputs */}
      {loadingData ? (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
          <p className="text-sm">Loading job openings and resume vault...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sophisticated-card p-6 rounded-2xl">
          {/* Select Job */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>1. Select Target Job Opening</span>
            </label>
            {jobs.length === 0 ? (
              <p className="text-xs text-amber-400">No active job openings found. Create a job opening first.</p>
            ) : (
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.department}) - {j.requiredSkills.length} required skills
                  </option>
                ))}
              </select>
            )}

            {selectedJob && (
              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <p className="text-slate-300 font-semibold">{selectedJob.title}</p>
                <p className="text-slate-400">Min Exp: {selectedJob.minExperienceYears} Yrs • Skills: {selectedJob.requiredSkills.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Select Resume */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>2. Select Candidate Resume</span>
            </label>
            {resumes.length === 0 ? (
              <p className="text-xs text-amber-400">No resumes in vault. Upload candidate resumes first.</p>
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.candidateName} - ({r.totalExperienceYears} Yrs Exp) [{r.filename}]
                  </option>
                ))}
              </select>
            )}

            {selectedResume && (
              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <p className="text-slate-300 font-semibold">{selectedResume.candidateName}</p>
                <p className="text-slate-400">{selectedResume.totalExperienceYears} Yrs Exp • Extracted Skills: {selectedResume.skills.slice(0, 6).join(', ')}</p>
              </div>
            )}
          </div>

          <div className="md:col-span-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            {errorMsg && (
              <p className="text-xs text-red-400 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </p>
            )}

            <button
              onClick={runAnalysisPipeline}
              disabled={analyzing || !selectedJob || !selectedResume}
              className="ml-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Workflow...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-indigo-200" />
                  <span>Run AI Match Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Progress Workflow Tracker during Analysis */}
      {analyzing && (
        <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>Executing Resume Analysis Workflow</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {steps.map((step, idx) => (
              <div
                key={step}
                className={`p-3 rounded-xl border text-xs flex items-center space-x-2 transition-all ${
                  idx < currentStep
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : idx === currentStep
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-bold animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {idx < currentStep ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : idx === currentStep ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center shrink-0">{idx + 1}</span>
                )}
                <span className="truncate">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Result Display Dashboard */}
      {analysisOutput && (
        <div className="space-y-6 animate-fade-in">
          {/* Score Header Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  analysisOutput.recommendation === 'Strong Match' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  analysisOutput.recommendation === 'Good Fit' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                  analysisOutput.recommendation === 'Potential Fit' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                }`}
              >
                {analysisOutput.recommendation}
              </span>
              <h2 className="text-3xl font-extrabold text-white">
                {analysisOutput.candidateName}
              </h2>
              <p className="text-slate-300 text-sm max-w-xl">
                Evaluated for <span className="font-semibold text-white">{analysisOutput.jobTitle}</span>
              </p>
            </div>

            {/* Match Score Badge Gauge */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-950/80 border border-indigo-500/30 rounded-2xl shadow-inner min-w-[180px]">
              <span className="text-xs uppercase font-bold text-slate-400">Match Score</span>
              <div className="text-5xl font-black text-white mt-1 mb-1 tracking-tight">
                {analysisOutput.matchScore}<span className="text-2xl text-indigo-400">%</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Weighted Composite</span>
            </div>
          </div>

          {/* Breakdown Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <p className="text-xs font-semibold text-slate-400 uppercase">Skills Fit Score</p>
              <h4 className="text-2xl font-bold text-white mt-1">{analysisOutput.breakdown.skillScore}%</h4>
              <p className="text-xs text-slate-500 mt-1">Matched {analysisOutput.skillsMatch.matchedSkills.length} of {selectedJob?.requiredSkills.length} core skills</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <p className="text-xs font-semibold text-slate-400 uppercase">Experience Index</p>
              <h4 className="text-2xl font-bold text-white mt-1">{analysisOutput.breakdown.expScore}%</h4>
              <p className="text-xs text-slate-500 mt-1">{selectedResume?.totalExperienceYears} yrs candidate vs {selectedJob?.minExperienceYears} yrs required</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <p className="text-xs font-semibold text-slate-400 uppercase">TF-IDF Semantic Similarity</p>
              <h4 className="text-2xl font-bold text-white mt-1">{analysisOutput.breakdown.semanticScore}%</h4>
              <p className="text-xs text-slate-500 mt-1">Cosine vector term alignment</p>
            </div>
          </div>

          {/* Detailed Skill Analysis & AI Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched vs Missing Skills */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <span>Skill Alignment Breakdown</span>
              </h3>

              <div>
                <p className="text-xs font-semibold text-emerald-400 uppercase mb-2">Matched Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {analysisOutput.skillsMatch.matchedSkills.length === 0 ? (
                    <span className="text-xs text-slate-500">None matched</span>
                  ) : (
                    analysisOutput.skillsMatch.matchedSkills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center space-x-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>{s}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-red-400 uppercase mb-2">Missing Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {analysisOutput.skillsMatch.missingSkills.length === 0 ? (
                    <span className="text-xs text-emerald-400 font-medium">All required skills met!</span>
                  ) : (
                    analysisOutput.skillsMatch.missingSkills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium flex items-center space-x-1">
                        <X className="w-3 h-3 text-red-400" />
                        <span>{s}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Additional Extracted Candidate Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysisOutput.skillsMatch.extraSkills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Summary & Key Highlights */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Executive AI Evaluation</span>
              </h3>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                {analysisOutput.summary}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Key Highlights</h4>
                <ul className="space-y-2">
                  {analysisOutput.keyHighlights.map((hl, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzePage;
