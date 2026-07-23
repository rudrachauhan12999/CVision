<div align="center">

# CVision

### AI Resume Intelligence Platform

Streamlining resume screening with AI-assisted candidate insights.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Backend-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/your-username/cvision?style=flat-square)](https://github.com/your-username/cvision/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/your-username/cvision?style=flat-square)](https://github.com/your-username/cvision/commits/main)

[Overview](#-overview) •
[Features](#-key-features) •
[Screenshots](#-screenshots) •
[Installation](#-installation) •
[Usage](#-usage-guide) •
[Contributing](#-contributing)

</div>

---

## 📖 Overview

**CVision** is an AI-powered recruitment platform built to modernize how recruiters screen and manage candidates. Instead of manually sifting through stacks of resumes, recruiters can upload documents, organize candidates in a centralized dashboard, and rely on AI-assisted insights to speed up hiring decisions.

The platform is built with a modern frontend stack (React, Vite, TypeScript, Tailwind CSS) paired with Firebase for authentication, data storage, and file management — giving it the responsiveness of a SaaS product with the simplicity of a serverless backend.

---

## ✨ Key Features

### Secure Authentication
Firebase Authentication powers a full login/signup flow, keeping recruiter accounts secure without a custom auth backend to maintain.

### Login & Signup
Clean, animated entry points for new and returning users, with form validation and clear error handling.

### Protected Routes
Route guarding ensures dashboard and candidate data are only accessible to authenticated recruiters.

### Resume Upload
Recruiters can upload candidate resumes directly through the UI, with files stored securely in Firebase Storage.

### Candidate Dashboard
A centralized view of all candidates, their uploaded resumes, and status at a glance.

### Recruiter Dashboard
A workspace tailored to recruiters for managing job pipelines and candidate activity.

### Resume Storage
All uploaded resumes are stored in Firebase Storage, linked to candidate records in Firestore.

### ML-Powered Resume Intelligence
ML-assisted analysis surfaces relevant insights from uploaded resumes to help recruiters make faster, better-informed decisions.

### Adaptive Design
A fully responsive layout that adapts cleanly across desktop, tablet, and mobile.

### Dark / Light Theme
Theme support for a comfortable viewing experience in any lighting condition.

### Real-time Database
Cloud Firestore keeps candidate and recruiter data in sync in real time across sessions.

### Modern SaaS UI
A polished, production-grade interface designed with the look and feel of a modern SaaS product.

---

## 🏗️ Architecture

CVision follows a client-heavy architecture backed by Firebase's managed services — no custom backend server is required.

```
┌─────────────────────┐
│   React Frontend     │  (Vite + TypeScript + Tailwind CSS)
└──────────┬───────────┘
           │
           ▼
┌─────────────────────┐
│ Firebase Auth        │  Handles login, signup, session management
└──────────┬───────────┘
           │
           ▼
┌─────────────────────┐
│ Cloud Firestore      │  Stores candidate & recruiter data (real-time)
└──────────┬───────────┘
           │
           ▼
┌─────────────────────┐
│ Firebase Storage     │  Stores uploaded resume files
└─────────────────────┘
```

The frontend communicates directly with Firebase's client SDKs, with Firestore security rules enforcing access control at the data layer.

---

## 📁 Folder Structure

```
cvision/
├── public/
├── src/
│   ├── assets/            # Static assets (images, icons, fonts)
│   ├── components/        # Reusable UI components
│   ├── context/           # React context providers (auth, theme, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Route-level page components
│   ├── services/          # Firebase config & API service wrappers
│   ├── utils/             # Helper functions & utilities
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | React |
| **Build Tool** | Vite |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion, SplitText, Silk animated background |
| **Routing** | React Router |
| **Icons** | Lucide React |
| **Authentication** | Firebase Authentication |
| **Database** | Cloud Firestore |
| **File Storage** | Firebase Storage |
| **Deployment** | Firebase Hosting / Vercel |

---

## ⚙️ Installation

### Prerequisites
- Node.js (v18 or higher)
- npm
- A Firebase project (see [Environment Variables](#-environment-variables))

### Steps

```bash
# Clone the repository
git clone https://github.com/your-username/cvision.git

# Navigate into the project directory
cd cvision

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` by default.

---

## 🚀 Usage Guide

1. **Register** — Create a recruiter account.
2. **Login** — Sign in securely via Firebase Authentication.
3. **Upload Resume** — Add candidate resumes through the upload interface.
4. **AI Processing** — Uploaded resumes are analyzed for relevant insights.
5. **Dashboard** — View candidates and hiring activity in one place.
6. **Candidate Management** — Organize, track, and manage candidates through the pipeline.

---

## 🔮 Future Improvements

- [ ] Resume scoring against job descriptions
- [ ] Deeper LLM integration for richer resume analysis
- [ ] Interview scheduling
- [ ] Automated email notifications
- [ ] Advanced analytics dashboard
- [ ] Role-based access control
- [ ] Side-by-side resume comparison
- [ ] AI-generated candidate summaries
- [ ] Candidate ranking system

---

## ⚡ Performance

- Fast initial load times powered by Vite's optimized build pipeline
- Efficient React rendering with component-level optimization
- Responsive UI across all device sizes
- Scalable backend via Firebase's managed cloud infrastructure

---

## 🔒 Security

- **Firebase Authentication** manages secure sign-in and session handling
- **Protected Routes** restrict dashboard access to authenticated users only
- **Firestore Security Rules** enforce data access permissions at the database level
- **Secure Storage** rules restrict resume file access to authorized users

---

## 📱 Responsive Design

CVision is designed to work seamlessly across:

- 🖥️ Desktop
- 📱 Tablet
- 📱 Mobile

---

## 🚢 Deployment

CVision can be deployed via  **Vercel**.

### Firebase Hosting

```bash
npm run build
firebase deploy
```

### Vercel

```bash
npm run build
vercel --prod
```

Ensure environment variables are configured in your hosting provider's dashboard before deploying.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style conventions and includes relevant tests where applicable.

---

---

## 👤 Author

**Rudra Chauhan**

---

<div align="center">

</div>
