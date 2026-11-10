# 4Bit Frontend Suite

This repository contains the frontend web applications for the **4BIT VoiceCare** platform. Each portal is organized into its own self-contained folder to ensure configurations, dependencies, and codebases do not conflict.

---

## 📁 Repository Structure

```text
4Bit-frontend/
├── problem-board/         # 4BIT VoiceCare - Patient Voice Terminal / Problem Board
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── public-board/          # 4BIT VoiceCare - Public Grievance Transparency Portal
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── staff-board/           # 4BIT VoiceCare - Staff Grievance Management Board
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── package-lock.json
│
├── .gitignore             # Global gitignore protecting all subfolders
└── README.md              # Global repository documentation
```

---

## 🚀 Available Portals

### 1. Patient Voice Terminal (`problem-board`)
An AI-powered, multilingual voice-enabled patient grievance kiosk and problem reporting terminal. Optimized for hospital lobby kiosks and patient check-in touchscreens.

- **Folder**: `problem-board/`
- **Getting Started**:
  ```bash
  cd problem-board
  npm install
  npm run dev
  ```

### 2. Public Grievance Transparency Portal (`public-board`)
A modern, responsive public transparency board for hospital patient feedback, grievance resolution status, and civic accountability. Built with React, TypeScript, Tailwind CSS, and Framer Motion.

- **Folder**: `public-board/`
- **Getting Started**:
  ```bash
  cd public-board
  npm install
  npm run dev
  ```

### 3. Staff Grievance Management Board (`staff-board`)
Internal administrative and staff portal for reviewing grievance evidence, AI assessments, status tracking, and resolution workflows.

- **Folder**: `staff-board/`
- **Getting Started**:
  ```bash
  cd staff-board
  npm install
  npm run dev
  ```

---

## ➕ Adding Another Portal / Folder

If you have another portal to add (e.g. `admin-portal`, `analytics-dashboard`):
1. Create a dedicated folder at the repository root:
   ```bash
   mkdir <new-portal>
   ```
2. Place that portal's code inside it (with its own `package.json`, `src/`, etc.).
3. Commit and push:
   ```bash
   git add <new-portal>/
   git commit -m "feat: add <new-portal> portal"
   git push origin main
   ```
This modular structure guarantees that each project stays independent and avoids any configuration or dependency collisions.
