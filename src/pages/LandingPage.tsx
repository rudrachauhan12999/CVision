import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SplitText from '../components/SplitText';
import {
  Sparkles,
  FileCheck,
  Zap,
  BarChart2,
  ShieldCheck,
  Brain,
  ArrowRight,
  CheckCircle2,
  Users,
  Search,
  Target,
  FileText,
  Building2,
  Star,
  Layers,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
<div className="relative min-h-screen text-slate-100 flex flex-col justify-between overflow-x-hidden font-sans bg-transparent">      {/* Fullscreen Fixed FloatingLines Background */}

      {/* Top Glass Sticky Header Bar */}
      <header className="sticky top-0 z-50 bg-[#09090B]/60 backdrop-blur-xl border-b border-white/10 w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 border border-white/10">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">
                CVision
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                AI Platform
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {currentUser ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/20 flex items-center space-x-2 border border-indigo-400/20"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white font-medium text-sm px-3.5 py-2 rounded-lg hover:bg-white/5 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/20 border border-indigo-400/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <section className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center flex flex-col items-center justify-center min-h-[75vh]">
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Resume Intelligence Platform</span>
          </div>

          <div className="mb-6 w-full flex flex-col items-center space-y-2">

    <SplitText
        text="Hire Faster."
        tag="h1"
        className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-white leading-none"
        delay={40}
        duration={0.8}
        ease="power3.out"
        splitType="chars"
        from={{ opacity: 0, y: 40 }}
        to={{ opacity: 1, y: 0 }}
        textAlign="center"
    />

    <SplitText
        text="Hire Smarter."
        tag="h1"
        className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-white leading-none"
        delay={40}
        duration={0.8}
        ease="power3.out"
        splitType="chars"
        from={{ opacity: 0, y: 40 }}
        to={{ opacity: 1, y: 0 }}
        textAlign="center"
    />

</div>
          {/* Hero Subheading using SplitText */}
          <div className="mb-10 max-w-2xl w-full flex justify-center">
            <SplitText
              text="CVision analyzes resumes, extracts skills and ranks candidates using AI in seconds."
              tag="p"
              className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed drop-shadow"
              delay={40}
              duration={0.8}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-50px"
              textAlign="center"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {currentUser ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 border border-indigo-400/20"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 border border-indigo-400/20"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#111827]/80 hover:bg-[#1f2937] border border-white/10 text-white font-medium text-base transition-all flex items-center justify-center space-x-2 shadow-lg backdrop-blur-md"
                >
                  <span>View Demo</span>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Statistics Section */}
        <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="saas-card p-6 rounded-2xl border border-white/10 bg-slate-900/55 backdrop-blur-md">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white">10x</h3>
              <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">Faster Candidate Screening</p>
            </div>
            <div className="saas-card p-6 rounded-2xl border border-white/10 bg-slate-900/55 backdrop-blur-md">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-indigo-400">98.4%</h3>
              <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">Semantic Match Accuracy</p>
            </div>
            <div className="saas-card p-6 rounded-2xl border border-white/10 bg-slate-900/55 backdrop-blur-md">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-purple-400">10k+</h3>
              <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">Resumes Processed</p>
            </div>
            <div className="saas-card p-6 rounded-2xl border border-white/10 bg-slate-900/55 backdrop-blur-md">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-emerald-400">&lt; 2s</h3>
              <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">Analysis Latency</p>
            </div>
          </div>
        </section>

        {/* Features Grid Section */}
        <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Enterprise AI Core</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Engineered for Modern Talent Acquisition
            </h3>
            <p className="text-slate-400 text-base mt-4">
              Eliminate manual resume reviewing with vector-based semantic scoring, automated entity extraction, and instant recruiter intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="saas-card p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Automated Document Parsing</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Seamlessly extract raw text, contact metrics, career history, and certifications from PDF and DOCX resume uploads.
                </p>
              </div>
            </div>

            <div className="saas-card p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
                  <Brain className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">TF-IDF & Cosine Match</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Computes high-precision term-frequency vector similarity between candidate profiles and job requirements.
                </p>
              </div>
            </div>

            <div className="saas-card p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Dynamic Evaluation Reports</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Generate instant PDF candidate evaluation reports featuring skill gaps, fit rankings, and actionable recommendation badges.
                </p>
              </div>
            </div>

            <div className="saas-card p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                  <Target className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Automated Skill Extraction</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Extract hard technical competencies and soft skills automatically using advanced natural language processing.
                </p>
              </div>
            </div>

            <div className="saas-card p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Candidate Fit Breakdown</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Filter candidates into Strong Match, Potential Match, or Weak Match tiers with clear evidence and skill overlaps.
                </p>
              </div>
            </div>

            <div className="saas-card p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Firebase Storage & Sync</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  All candidate files, evaluation logs, and recruiter preferences persist securely across sessions with real-time sync.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Workflow</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">How CVision Works</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="saas-card p-6 rounded-2xl relative border border-white/10 bg-slate-900/55 backdrop-blur-md">
              <span className="text-4xl font-extrabold text-indigo-500/20 absolute top-4 right-4">01</span>
              <h4 className="text-lg font-bold text-white mb-2 mt-4">Create Job Opening</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Define key responsibilities, required technical skills, and experience criteria.
              </p>
            </div>

            <div className="saas-card p-6 rounded-2xl relative border border-white/10 bg-slate-900/55 backdrop-blur-md">
              <span className="text-4xl font-extrabold text-indigo-500/20 absolute top-4 right-4">02</span>
              <h4 className="text-lg font-bold text-white mb-2 mt-4">Upload Resumes</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Drag and drop single or bulk candidate documents into your secure repository vault.
              </p>
            </div>

            <div className="saas-card p-6 rounded-2xl relative border border-white/10 bg-slate-900/55 backdrop-blur-md">
              <span className="text-4xl font-extrabold text-indigo-500/20 absolute top-4 right-4">03</span>
              <h4 className="text-lg font-bold text-white mb-2 mt-4">Run AI Match Engine</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                CVision analyzes term vectors and semantic concepts in under two seconds.
              </p>
            </div>

            <div className="saas-card p-6 rounded-2xl relative border border-white/10 bg-slate-900/55 backdrop-blur-md">
              <span className="text-4xl font-extrabold text-indigo-500/20 absolute top-4 right-4">04</span>
              <h4 className="text-lg font-bold text-white mb-2 mt-4">Rank & Export</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Review candidate score rankings and export comprehensive evaluation summaries.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Customer Impact</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Trusted by Hiring Leaders</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="saas-card p-6 rounded-2xl flex flex-col justify-between border border-white/10 bg-slate-900/55 backdrop-blur-md">
              <div className="space-y-4">
                <div className="flex text-amber-400 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "CVision reduced our technical screening time by 80%. We identified our principal engineer candidate in under ten minutes."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                  EK
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">Elena Rostova</h5>
                  <p className="text-xs text-slate-400">Head of Talent, NexusTech</p>
                </div>
              </div>
            </div>

            <div className="saas-card p-6 rounded-2xl flex flex-col justify-between border border-white/10 bg-slate-900/55 backdrop-blur-md">
              <div className="space-y-4">
                <div className="flex text-amber-400 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "The TF-IDF cosine match score gives our hiring managers immediate clarity on skill alignment before scheduling interviews."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-sm">
                  MC
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">Marcus Chen</h5>
                  <p className="text-xs text-slate-400">VP of HR, CloudScale</p>
                </div>
              </div>
            </div>

            <div className="saas-card p-6 rounded-2xl flex flex-col justify-between border border-white/10 bg-slate-900/55 backdrop-blur-md">
              <div className="space-y-4">
                <div className="flex text-amber-400 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "The automated candidate reports saved our recruiters dozens of hours writing debrief summaries every week."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
                  SR
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">Sarah Reynolds</h5>
                  <p className="text-xs text-slate-400">Lead Recruiter, Pulse AI</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call To Action Banner */}
        <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-20">
          <div className="saas-card p-10 sm:p-14 rounded-3xl text-center relative overflow-hidden border border-indigo-500/30 bg-gradient-to-br from-[#111827] via-[#1a233a] to-[#111827]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Supercharge Your Recruiting Today
            </h3>
            <p className="text-slate-300 text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Join top hiring teams using CVision to analyze resumes, discover top talent, and build high-performing engineering teams.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 border border-indigo-400/20"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#09090B]/80 backdrop-blur-md py-10 text-slate-400 text-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">CVision</span>
            <span className="text-xs text-slate-500 ml-2">AI Resume Intelligence Platform</span>
          </div>

          <p className="text-xs text-slate-500">
            © 2026 CVision. All rights reserved.
          </p>

          <div className="flex items-center space-x-6 text-xs text-slate-400">
            <Link to="/login" className="hover:text-white transition">Sign In</Link>
            <Link to="/register" className="hover:text-white transition">Register</Link>
            <Link to="/dashboard" className="hover:text-white transition">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
