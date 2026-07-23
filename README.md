# CVision - AI Resume Intelligence Platform

**CVision** is an enterprise AI-powered resume screening and candidate matching platform designed for recruiters, talent acquisition teams, and hiring managers. It automates candidate document parsing, computes TF-IDF vector similarity and cosine matching against job descriptions, extracts candidate skills, and generates comprehensive evaluation reports.

---

## 🌟 Key Features

- **Automated Resume Parsing**: Extracts raw text, work history, and contact metrics from PDF and DOCX files.
- **AI Semantic Matching**: Uses TF-IDF term-frequency vectorization and cosine distance to calculate precise candidate match scores (0-100%).
- **Skill Extraction**: Automatically tags hard technical skills and soft competencies using NLP and master skill taxonomies.
- **Interactive Recruiter Dashboard**: Visualize match score distributions, recommendation breakdowns, and recent candidate evaluations.
- **Candidate Evaluation Reports**: Export and compare candidate fit profiles side-by-side with recommendations (Strong Match, Good Fit, Potential Fit, Not Recommended).
- **Firebase Auth & Firestore Sync**: Real-time persistent state across user sessions with secure role-based recruiter access control.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Animations**: GSAP, @gsap/react, Three.js (Silk Wave Shaders)
- **Backend & Database**: Firebase Authentication, Firestore, Firebase Storage
- **Document Processing**: `pdfjs-dist`, `mammoth`, `compromise`, `fuse.js`
- **Charts & Visualizations**: Recharts

---

## 🚀 Firebase Setup & Configuration

To enable Email/Password Authentication in your Firebase Console:

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Select your Firebase project (`turing-river-h7c1c`).
3. Go to **Build > Authentication > Sign-in method**.
4. Click on **Email/Password** and set it to **Enabled**.
5. Save changes.

---

## 📄 License

CVision — AI Resume Intelligence Platform © 2026. All rights reserved.
