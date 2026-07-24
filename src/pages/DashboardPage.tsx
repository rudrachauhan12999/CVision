import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Job, ResumeDocument, AnalysisResult } from '../types';
import {
  FileText,
  Briefcase,
  Sparkles,
  TrendingUp,
  Award,
  Users,
  PlusCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  Search,
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
  Activity,
  Cpu
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<ResumeDocument[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch Jobs with error callback
    const jobsQuery = query(collection(db, 'jobs'));
    const unsubJobs = onSnapshot(
      jobsQuery,
      (snapshot) => {
        const items: Job[] = [];
        snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() } as Job));
        setJobs(items);
      },
      (error) => console.error('Firestore jobs error:', error)
    );

    // Fetch Resumes with error callback
    const resumesQuery = query(collection(db, 'resumes'));
    const unsubResumes = onSnapshot(
      resumesQuery,
      (snapshot) => {
        const items: ResumeDocument[] = [];
        snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() } as ResumeDocument));
        setResumes(items);
      },
      (error) => console.error('Firestore resumes error:', error)
    );

    // Fetch Recent Analyses with error callback
    const analysesQuery = query(collection(db, 'analysis'));
    const unsubAnalyses = onSnapshot(
      analysesQuery,
      (snapshot) => {
        const items: AnalysisResult[] = [];
        snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() } as AnalysisResult));
        items.sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());
        setAnalyses(items);
        setLoading(false);
      },
      (error) => console.error('Firestore analysis error:', error)
    );

    return () => {
      unsubJobs();
      unsubResumes();
      unsubAnalyses();
    };
  }, [currentUser]);

  // Compute Core Metrics
  const activeJobsCount = jobs.filter((j) => j.status === 'Active').length;
  const totalResumesCount = resumes.length;
  const totalAnalysesCount = analyses.length;

  const avgMatchScore =
    analyses.length > 0
      ? Math.round(analyses.reduce((acc, a) => acc + a.matchScore, 0) / analyses.length)
      : 0;

  // 1. Resume Match Trends over Time (AreaChart)
  const matchTrendsData = useMemo(() => {
    if (analyses.length === 0) return [];

    const dateMap: Record<string, { dateLabel: string; timestamp: number; scores: number[]; count: number }> = {};

    analyses.forEach((a) => {
      const d = new Date(a.analyzedAt);
      if (isNaN(d.getTime())) return;
      const dateKey = d.toISOString().split('T')[0];
      const dateLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          dateLabel,
          timestamp: new Date(dateKey).getTime(),
          scores: [],
          count: 0
        };
      }
      dateMap[dateKey].scores.push(a.matchScore);
      dateMap[dateKey].count += 1;
    });

    return Object.values(dateMap)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((item) => ({
        date: item.dateLabel,
        avgScore: Math.round(item.scores.reduce((sum, v) => sum + v, 0) / item.scores.length),
        evaluations: item.count
      }));
  }, [analyses]);

  // 2. Skill Distribution across Candidates (Horizontal BarChart)
  const skillDistributionData = useMemo(() => {
    const skillCounts: Record<string, number> = {};

    // Count skills from parsed resumes
    resumes.forEach((r) => {
      if (Array.isArray(r.skills)) {
        r.skills.forEach((s) => {
          const name = s.trim();
          if (name) skillCounts[name] = (skillCounts[name] || 0) + 1;
        });
      }
    });

    // Count matched skills from analyses
    analyses.forEach((a) => {
      if (a.skillsMatch?.matchedSkills) {
        a.skillsMatch.matchedSkills.forEach((s) => {
          const name = s.trim();
          if (name) skillCounts[name] = (skillCounts[name] || 0) + 1;
        });
      }
    });

    return Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [resumes, analyses]);

  // 3. Applicant Volume & Quality by Role (BarChart)
  const applicantVolumeData = useMemo(() => {
    const roleMap: Record<string, { jobTitle: string; count: number; scores: number[] }> = {};

    // Collect from active jobs
    jobs.forEach((j) => {
      roleMap[j.title] = { jobTitle: j.title, count: 0, scores: [] };
    });

    // Aggregate from analyses
    analyses.forEach((a) => {
      const title = a.jobTitle || 'General Position';
      if (!roleMap[title]) {
        roleMap[title] = { jobTitle: title, count: 0, scores: [] };
      }
      roleMap[title].count += 1;
      roleMap[title].scores.push(a.matchScore);
    });

    // Fallback if no analyses yet
    if (analyses.length === 0 && resumes.length > 0) {
      resumes.forEach((_, idx) => {
        const title = jobs[idx % (jobs.length || 1)]?.title || 'General Pool';
        if (!roleMap[title]) roleMap[title] = { jobTitle: title, count: 0, scores: [] };
        roleMap[title].count += 1;
      });
    }

    return Object.values(roleMap)
      .map((item) => ({
        role: item.jobTitle.length > 18 ? `${item.jobTitle.slice(0, 16)}...` : item.jobTitle,
        fullTitle: item.jobTitle,
        applicants: item.count,
        avgMatch: item.scores.length > 0 ? Math.round(item.scores.reduce((a, b) => a + b, 0) / item.scores.length) : 0
      }))
      .sort((a, b) => b.applicants - a.applicants)
      .slice(0, 6);
  }, [jobs, analyses, resumes]);

  // 4. Recommendation breakdown for pie chart
  const pieData = useMemo(() => [
    { name: 'Strong Match', value: analyses.filter((a) => a.recommendation === 'Strong Match').length, color: '#10B981' },
    { name: 'Good Fit', value: analyses.filter((a) => a.recommendation === 'Good Fit').length, color: '#3B82F6' },
    { name: 'Potential Fit', value: analyses.filter((a) => a.recommendation === 'Potential Fit').length, color: '#F59E0B' },
    { name: 'Not Rec.', value: analyses.filter((a) => a.recommendation === 'Not Recommended').length, color: '#6B7280' }
  ].filter((d) => d.value > 0), [analyses]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0d0e16] via-[#14172a] to-[#0d0e16] border border-[#23273e] p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Talent Intelligence Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {userProfile?.displayName || 'Recruiter'}!
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Analyze candidate fit, view real-time TF-IDF semantic match scores, and track hiring pipelines with live Firestore analytics.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/resumes"
            className="px-4 py-2.5 rounded-xl bg-[#181a26] hover:bg-[#202436] text-white font-medium text-sm border border-[#2a2f47] transition flex items-center space-x-2 shadow-sm"
          >
            <FileText className="w-4 h-4 text-slate-300" />
            <span>Upload Resume</span>
          </Link>
          <Link
            to="/analyze"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>Run AI Match</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="sophisticated-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Openings</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{activeJobsCount}</h3>
            <p className="text-xs text-slate-500 mt-1">{jobs.length} total job listings</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="sophisticated-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resumes Vault</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{totalResumesCount}</h3>
            <p className="text-xs text-emerald-400 mt-1">Parsed & Indexed</p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="sophisticated-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Match Score</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{avgMatchScore}%</h3>
            <p className="text-xs text-indigo-400 mt-1">Weighted TF-IDF fit</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="sophisticated-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Analyses Executed</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{totalAnalysesCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Stored in Firestore</p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Row 1: Resume Match Score Trends & Skill Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume Match Trends Over Time */}
        <div className="lg:col-span-2 sophisticated-card p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Resume Match Score Trends</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time average candidate evaluation score % over evaluation history
              </p>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
              Firestore Stream
            </div>
          </div>

          {matchTrendsData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm">
              <Sparkles className="w-8 h-8 mb-2 text-slate-600" />
              <p>No evaluation trends yet.</p>
              <Link to="/analyze" className="text-indigo-400 hover:underline text-xs mt-1">
                Run an AI match analysis to generate trends
              </Link>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={matchTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2438" vertical={false} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0d0e15',
                      borderColor: '#222638',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val: any, name: any) => [
                      name === 'avgScore' ? `${val}%` : val,
                      name === 'avgScore' ? 'Avg Match Score' : 'Evaluations'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#818CF8"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreGlow)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Skill Distribution */}
        <div className="sophisticated-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Top Candidate Skills</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Most frequent skills extracted from Firestore resumes</p>

            {skillDistributionData.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-slate-500 text-sm">
                <FileText className="w-8 h-8 mb-2 text-slate-600" />
                <p>No skills data recorded.</p>
                <Link to="/resumes" className="text-indigo-400 hover:underline text-xs mt-1">Upload candidate resumes</Link>
              </div>
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={skillDistributionData}
                    margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                  >
                    <XAxis type="number" stroke="#94A3B8" fontSize={11} hide />
                    <YAxis
                      dataKey="skill"
                      type="category"
                      stroke="#CBD5E1"
                      fontSize={11}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d0e15',
                        borderColor: '#222638',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      formatter={(val: any) => [`${val} candidate(s)`, 'Frequency']}
                    />
                    <Bar dataKey="count" fill="#6366F1" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Applicant Volume & Match Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applicant Volume by Target Role */}
        <div className="lg:col-span-2 sophisticated-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Applicant Volume & Match Quality</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Candidate applicant volume vs average match score per opening</p>
            </div>
            <div className="p-2 bg-[#171a27] rounded-lg text-slate-400 border border-[#23273e]">
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
          </div>

          {applicantVolumeData.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-slate-500 text-sm">
              <Briefcase className="w-8 h-8 mb-2 text-slate-600" />
              <p>No job role application data found.</p>
              <Link to="/jobs" className="text-indigo-400 hover:underline text-xs mt-1">Create a job posting</Link>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={applicantVolumeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2438" vertical={false} />
                  <XAxis dataKey="role" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0d0e15',
                      borderColor: '#222638',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val: any, name: any) => [
                      name === 'applicants' ? `${val} applicant(s)` : `${val}%`,
                      name === 'applicants' ? 'Volume' : 'Avg Score'
                    ]}
                  />
                  <Bar dataKey="applicants" fill="#3B82F6" radius={[6, 6, 0, 0]} name="applicants" />
                  <Bar dataKey="avgMatch" fill="#10B981" radius={[6, 6, 0, 0]} name="avgMatch" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Candidate Recommendation Distribution */}
        <div className="sophisticated-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <PieChartIcon className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Recommendation Breakdown</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Proportion of candidate fit classifications</p>

            {analyses.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                No recommendation data
              </div>
            ) : (
              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d0e15',
                        borderColor: '#222638',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-[#1e2233] text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Strong Match</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-300">Good Fit</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-300">Potential Fit</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span className="text-slate-300">Not Rec.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Evaluations Table */}
      <div className="sophisticated-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Candidate Evaluations</h3>
            <p className="text-xs text-slate-400">Live feed of AI matching outputs and scores</p>
          </div>
          <Link
            to="/reports"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>View All Reports</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {analyses.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-medium text-slate-400">No evaluations recorded yet.</p>
            <p className="text-xs text-slate-500 mt-1">Upload candidate resumes and select a job opening to evaluate match scores.</p>
            <Link
              to="/analyze"
              className="inline-flex items-center space-x-2 px-4 py-2 mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Analysis</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Target Role</th>
                  <th className="px-6 py-4">Match Score</th>
                  <th className="px-6 py-4">Recommendation</th>
                  <th className="px-6 py-4">Evaluated At</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {analyses.slice(0, 6).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-semibold text-white flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold">
                        {item.candidateName ? item.candidateName.charAt(0) : 'C'}
                      </div>
                      <span>{item.candidateName}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{item.jobTitle}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-white">{item.matchScore}%</span>
                        <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              item.matchScore >= 85
                                ? 'bg-emerald-500'
                                : item.matchScore >= 70
                                ? 'bg-blue-500'
                                : item.matchScore >= 55
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${item.matchScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.recommendation === 'Strong Match'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.recommendation === 'Good Fit'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : item.recommendation === 'Potential Fit'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {item.recommendation}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(item.analyzedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/reports"
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                      >
                        View Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
