export interface UserProfile {
  uid: string;
  fullName: string;
  displayName?: string;
  email: string;
  company: string;
  role: 'recruiter' | 'hiring_manager' | 'admin' | 'candidate' | string;
  photoURL?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  salaryRange?: string;
  status: 'Active' | 'Draft' | 'Closed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeDocument {
  id: string;
  uid: string;
  candidateName: string;
  email: string;
  phone: string;
  filename: string;
  fileUrl: string;
  storagePath: string;
  fileType: string;
  fileSize: number;
  rawText: string;
  cleanText: string;
  skills: string[];
  totalExperienceYears: number;
  summary: string;
  uploadedAt: string;
  status: 'Parsed' | 'Processing' | 'Failed';
}

export interface SkillsMatchBreakdown {
  matchedSkills: string[];
  missingSkills: string[];
  extraSkills: string[];
  matchRatio: number; // 0 to 1
}

export interface AnalysisResult {
  id: string;
  resumeId: string;
  jobId: string;
  candidateName: string;
  jobTitle: string;
  matchScore: number; // 0 - 100
  skillsMatch: SkillsMatchBreakdown;
  tfidfSimilarity: number; // 0 - 1
  experienceScore: number; // 0 - 100
  recommendation: 'Strong Match' | 'Good Fit' | 'Potential Fit' | 'Not Recommended';
  summary: string;
  keyHighlights: string[];
  breakdown: {
    skillScore: number;
    expScore: number;
    semanticScore: number;
  };
  analyzedAt: string;
  uid: string;
}

export interface EvaluationReport {
  id: string;
  resumeId: string;
  jobId: string;
  candidateName: string;
  jobTitle: string;
  reportUrl: string;
  storagePath: string;
  generatedAt: string;
  summary: string;
  matchScore: number;
  recommendation: string;
  uid: string;
}
