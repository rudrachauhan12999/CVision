import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { AnalysisResult, EvaluationReport } from '../types';
import {
  BarChart3,
  Download,
  Trash2,
  CheckCircle2,
  Sparkles,
  FileText,
  Search,
  Filter,
  Users,
  Award,
  Loader2,
  X,
  ExternalLink
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [reports, setReports] = useState<EvaluationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('All');

  // Candidate comparison multi-select state
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Export report state
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch analyses
    const unsubAnalyses = onSnapshot(query(collection(db, 'analysis')), (snapshot) => {
      const items: AnalysisResult[] = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() } as AnalysisResult));
      items.sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());
      setAnalyses(items);
    });

    // Fetch saved reports
    const unsubReports = onSnapshot(query(collection(db, 'reports')), (snapshot) => {
      const items: EvaluationReport[] = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() } as EvaluationReport));
      items.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
      setReports(items);
      setLoading(false);
    });

    return () => {
      unsubAnalyses();
      unsubReports();
    };
  }, [currentUser]);

  // Unique job titles for filter
  const uniqueJobs = Array.from(new Set(analyses.map(a => a.jobTitle)));

  // Filtered analyses
  const filteredAnalyses = analyses.filter(a => selectedJobFilter === 'All' || a.jobTitle === selectedJobFilter);

  // Toggle comparison selection
  const toggleSelectForCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(i => i !== id));
    } else {
      if (selectedForCompare.length >= 4) {
        alert('You can compare up to 4 candidates at once.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  // Generate downloadable HTML/PDF Evaluation Report
  const generateAndDownloadReport = async (analysis: AnalysisResult) => {
    if (!currentUser) return;

    try {
      setGeneratingReport(analysis.id);

      const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Candidate Evaluation Report - ${analysis.candidateName}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #0F172A; max-width: 800px; margin: 0 auto; background: #FFF; }
            .header { border-bottom: 2px solid #6366F1; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .brand { font-size: 24px; font-weight: bold; color: #4338CA; }
            .badge { background: #EEF2FF; color: #4338CA; padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 14px; }
            .score-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 25px; text-align: center; }
            .score-num { font-size: 48px; font-weight: 900; color: #4338CA; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
            .card { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 15px; border-radius: 8px; }
            .skill-tag { display: inline-block; background: #E0E7FF; color: #3730A3; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin: 2px; }
            .missing-tag { display: inline-block; background: #FEE2E2; color: #991B1B; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin: 2px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">CVision</div>
              <p style="color: #64748B; font-size: 12px; margin-top: 4px;">AI Candidate Intelligence Report</p>
            </div>
            <div class="badge">${analysis.recommendation}</div>
          </div>

          <h2>Candidate: ${analysis.candidateName}</h2>
          <p style="color: #475569;">Target Role: <strong>${analysis.jobTitle}</strong> | Date: ${new Date(analysis.analyzedAt).toLocaleDateString()}</p>

          <div class="score-box">
            <div style="font-size: 12px; color: #64748B; text-transform: uppercase;">Composite Match Score</div>
            <div class="score-num">${analysis.matchScore}%</div>
            <p style="font-size: 13px; color: #475569;">${analysis.summary}</p>
          </div>

          <div class="grid">
            <div class="card">
              <h3>Matched Skills</h3>
              <div>${analysis.skillsMatch.matchedSkills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
            </div>
            <div class="card">
              <h3>Missing Core Skills</h3>
              <div>${analysis.skillsMatch.missingSkills.map(s => `<span class="missing-tag">${s}</span>`).join('')}</div>
            </div>
          </div>

          <div class="card">
            <h3>Key Analysis Highlights</h3>
            <ul>
              ${analysis.keyHighlights.map(h => `<li>${h}</li>`).join('')}
            </ul>
          </div>
        </body>
        </html>
      `;

      // Upload HTML string to Firebase Storage
      const storagePath = `reports/${currentUser.uid}/${analysis.id}_report.html`;
      const storageRef = ref(storage, storagePath);

      let reportUrl = '';
      try {
        await uploadString(storageRef, reportHtml, 'raw', { contentType: 'text/html' });
        reportUrl = await getDownloadURL(storageRef);
      } catch (stErr) {
        console.warn('Storage upload fallback:', stErr);
        // Data URI fallback
        reportUrl = `data:text/html;charset=utf-8,${encodeURIComponent(reportHtml)}`;
      }

      // Save report document to Firestore
      await addDoc(collection(db, 'reports'), {
        resumeId: analysis.resumeId,
        jobId: analysis.jobId,
        candidateName: analysis.candidateName,
        jobTitle: analysis.jobTitle,
        reportUrl,
        storagePath,
        generatedAt: new Date().toISOString(),
        summary: analysis.summary,
        matchScore: analysis.matchScore,
        recommendation: analysis.recommendation,
        uid: currentUser.uid
      });

      // Trigger browser download
      const blob = new Blob([reportHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Report_${analysis.candidateName.replace(/\s+/g, '_')}_${analysis.jobTitle.replace(/\s+/g, '_')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDeleteReport = async (report: EvaluationReport) => {
    if (window.confirm(`Delete report for ${report.candidateName}?`)) {
      try {
        await deleteDoc(doc(db, 'reports', report.id));
        if (report.storagePath) {
          try {
            await deleteObject(ref(storage, report.storagePath));
          } catch (e) { /* ignore */ }
        }
      } catch (err) {
        console.error('Error deleting report:', err);
      }
    }
  };

  const comparedCandidates = analyses.filter(a => selectedForCompare.includes(a.id));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reports & Candidate Comparison</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Generate candidate evaluation exports and compare multiple candidate fit profiles side by side
          </p>
        </div>

        {selectedForCompare.length >= 2 && (
          <button
            onClick={() => setCompareModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Compare Selected ({selectedForCompare.length})</span>
          </button>
        )}
      </div>

      {/* Filter bar */}
      {uniqueJobs.length > 0 && (
        <div className="flex items-center space-x-2 sophisticated-card p-3 rounded-xl overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-2">Filter by Job:</span>
          <button
            onClick={() => setSelectedJobFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
              selectedJobFilter === 'All' ? 'bg-indigo-600 text-white' : 'bg-[#181a26] text-slate-400 hover:text-white'
            }`}
          >
            All Openings
          </button>
          {uniqueJobs.map((job) => (
            <button
              key={job}
              onClick={() => setSelectedJobFilter(job)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                selectedJobFilter === job ? 'bg-indigo-600 text-white' : 'bg-[#181a26] text-slate-400 hover:text-white'
              }`}
            >
              {job}
            </button>
          ))}
        </div>
      )}

      {/* Evaluated Candidates Grid / Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
          <p className="text-sm">Fetching reports data...</p>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="sophisticated-card rounded-2xl p-12 text-center text-slate-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <h3 className="text-base font-bold text-white">No evaluation reports generated</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Run AI match analyses between candidates and jobs to generate evaluation reports.
          </p>
        </div>
      ) : (
        <div className="sophisticated-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 text-xs text-slate-400 flex items-center justify-between">
            <span>Select candidates to compare fit profiles side-by-side</span>
            <span>{selectedForCompare.length} selected</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-4 text-center">Compare</th>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Job Role</th>
                  <th className="px-6 py-4">Match Score</th>
                  <th className="px-6 py-4">Skills Coverage</th>
                  <th className="px-6 py-4">Recommendation</th>
                  <th className="px-6 py-4 text-right">Download Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAnalyses.map((item) => {
                  const isSelected = selectedForCompare.includes(item.id);
                  return (
                    <tr key={item.id} className={`hover:bg-slate-800/40 transition ${isSelected ? 'bg-indigo-500/10' : ''}`}>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectForCompare(item.id)}
                          className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      <td className="px-6 py-4 font-bold text-white">
                        {item.candidateName}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {item.jobTitle}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-extrabold text-white text-base">{item.matchScore}%</span>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        <span className="text-emerald-400 font-semibold">{item.skillsMatch.matchedSkills.length} Matched</span>
                        {item.skillsMatch.missingSkills.length > 0 && (
                          <span className="text-red-400 ml-2">({item.skillsMatch.missingSkills.length} Missing)</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.recommendation === 'Strong Match' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            item.recommendation === 'Good Fit' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            item.recommendation === 'Potential Fit' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-slate-500/10 text-slate-400'
                          }`}
                        >
                          {item.recommendation}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => generateAndDownloadReport(item)}
                          disabled={generatingReport === item.id}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow transition disabled:opacity-50"
                        >
                          {generatingReport === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span>Export Report</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comparison Modal Matrix */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Candidate Comparison Matrix</h3>
              </div>
              <button
                onClick={() => setCompareModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {comparedCandidates.map((cand) => (
                <div key={cand.id} className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-[10px] uppercase font-bold text-indigo-400">{cand.recommendation}</span>
                    <h4 className="text-base font-bold text-white">{cand.candidateName}</h4>
                    <p className="text-xs text-slate-400">{cand.jobTitle}</p>
                  </div>

                  <div className="text-center p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <p className="text-[10px] uppercase text-slate-500 font-bold">Match Score</p>
                    <p className="text-3xl font-black text-white">{cand.matchScore}%</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-emerald-400 font-semibold mb-1">Matched Skills ({cand.skillsMatch.matchedSkills.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {cand.skillsMatch.matchedSkills.map(s => (
                          <span key={s} className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-300 rounded text-[10px] font-medium">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-red-400 font-semibold mb-1">Missing Skills ({cand.skillsMatch.missingSkills.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {cand.skillsMatch.missingSkills.map(s => (
                          <span key={s} className="px-1.5 py-0.5 bg-red-500/10 text-red-300 rounded text-[10px] font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                    {cand.summary}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-slate-800">
              <button
                onClick={() => setCompareModalOpen(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
