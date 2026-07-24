# CVision

Intelligent Resume Screening Platform

CVision is a web application that streamlines recruitment by allowing recruiters to upload resumes, manage candidates, and analyze resumes against job requirements through a structured resume analysis pipeline. It is built to organize and speed up screening, not to replace recruiter judgment.

---

## Why CVision Exists

Recruitment teams commonly deal with large volumes of applicants, manual resume review, and candidate information scattered across email threads, spreadsheets, and file folders. Comparing qualifications across dozens or hundreds of resumes by hand is slow and inconsistent, and there is rarely a single place to track where a candidate stands in the process.

CVision was built to centralize this workflow: one application to store resumes, manage candidates, and surface structured information that supports a hiring decision, rather than making that decision automatically.

---

## What CVision Does

- **Secure authentication** — recruiters sign in through Firebase Authentication.
- **Resume upload** — resumes are uploaded through the UI and attached to a job or candidate record.
- **Candidate management** — candidates are tracked in a central list, not spread across separate files.
- **Resume storage** — uploaded files are stored in Firebase Storage and linked to their candidate record.
- **Resume analysis** — uploaded resumes are parsed into structured data [Resume Analysis].
- **Job management** — recruiters organize candidates by job posting.
- **Recruiter dashboard** — a single view of jobs, candidates, and their status.
- **Cloud-backed storage** — data is persisted in Cloud Firestore and Firebase Storage rather than local files.
- **Responsive interface** — usable on desktop, tablet, and mobile screen sizes.

---

## What CVision Does NOT Do

To be explicit about current boundaries:

- ❌ Does not replace recruiter decisions
- ❌ Does not automatically hire or reject candidates
- ❌ Does not train machine learning models
- ❌ Does not make unexplained or hidden decisions
- ❌ Does not send resume data to third-party AI services

---

## Supported Scope

Current capabilities:

- **Resume format**: PDF and common document formats supported by the upload component
- **Authentication**: Firebase Authentication (email/password)
- **Storage**: Firebase Storage for resume files, Cloud Firestore for candidate and job records
- **Candidate management**: single-recruiter and multi-job organization
- **Deployment**: static frontend, deployable to Firebase Hosting or Vercel

Out of scope for the current version:

- Multi-tenant or organization-level permissions
- Bulk resume import from external ATS platforms
- Automated candidate scoring or ranking

---

## Installation

### Prerequisites

- Node.js 18 or later
- npm
- A Firebase project

### Steps

```bash
git clone https://github.com/your-username/cvision.git
cd cvision
npm install
npm run dev
```

The application runs at https://cvision-git-main-rudrachauhan12999s-projects.vercel.app/

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

These values are available in the Firebase Console under **Project Settings → General → Your apps**.

---

## Project Structure

```
cvision/
├── public/
├── src/
│   ├── assets/            # Static assets (images, icons, fonts)
│   ├── components/        # Reusable UI components
│   ├── context/           # Auth and app-level context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Route-level page components
│   ├── services/          # Firebase configuration and API wrappers
│   ├── utils/             # Helper functions
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

`services/` holds all Firebase read/write logic, so components do not talk to Firebase directly. `context/` holds the authentication state shared across the app.

## Application Workflow

```
Recruiter logs in
      ↓
Creates or selects a job
      ↓
Uploads resumes
      ↓
Resumes stored securely (Firebase Storage)
      ↓
Resume data analyzed (parsing + extraction)
      ↓
Candidate information displayed on dashboard
      ↓
Recruiter reviews results and takes action
```

Each step is visible to the recruiter — there is no background process that changes candidate status without a corresponding action in the UI.

---

## Resume Analysis

CVision applies a structured, rule-based analysis pipeline to each uploaded resume:

1. **Resume parsing** — extracts raw text and document structure from the uploaded file.
2. **Skill extraction** — identifies skill keywords present in the parsed text.
3. **Candidate organization** — attaches parsed data (skills, experience entries, education) to the candidate's record.
4. **Structured summaries** — presents extracted fields in a consistent, readable format on the candidate view.

This pipeline does not use machine learning models and does not score or rank candidates. It restructures resume content so a recruiter can review it faster. Scoring and ranking are listed under [Roadmap](#roadmap) as future work, not current behavior.

---

## Data Storage

CVision relies on three Firebase services, each with a distinct role:

- **Firebase Authentication** manages recruiter identity and session state.
- **Cloud Firestore** stores structured records — jobs, candidates, and parsed resume data — and keeps them in sync in real time across the app.
- **Firebase Storage** stores the original resume files, referenced from the corresponding Firestore document.

No custom backend server is required; the frontend communicates with these services directly through the Firebase client SDKs.

---

## Security

- **Authentication** is required to access any recruiter-facing route.
- **Protected routes** redirect unauthenticated users before any data request is made.
- **Firestore security rules** restrict read/write access to a recruiter's own data.
- **Cloud storage rules** restrict resume file access to authenticated, authorized requests.

---

## Design Principles

- **Transparency** — every displayed result traces back to a visible step in the pipeline.
- **Predictable behavior** — the same input produces the same output; no hidden randomness.
- **Simple workflows** — the recruiter path (login → job → upload → review) stays linear.
- **Minimal user friction** — common actions (upload, review, search) require few steps.
- **Maintainability** — Firebase logic is isolated in `services/`, keeping components focused on presentation.

---

## Roadmap

Planned, not implemented:

- Resume comparison (side-by-side candidate view)
- Candidate ranking
- Interview scheduling
- Email notifications

None of the items above are part of the current application.

---

## Status

CVision is functional and under active development. Core workflows — authentication, upload, storage, and structured resume analysis — are implemented and in use. Interfaces and internal structure may still change as the project evolves.
