# OmniWork AI

OmniWork AI is a Windows desktop application built with Electron, React, TypeScript, and Tailwind CSS.
It provides a unified productivity workspace with an embedded spreadsheet engine (Univer) and an intelligent AI sidebar powered by Google Gemini.

## Features
- **Bilingual Interface**: Full Central Kurdish (Sorani RTL) and English (LTR) localization.
- **Spreadsheet Workspace**: 90% spreadsheet canvas powered by Univer Sheets with full formula and editing support.
- **AI Assistant**: 10% sidebar for generating Excel formulas from natural language descriptions.
- **Background Pre-processing**: Silent predictive formula caching on cell selection for near-instant responses.
- **Local Persistence**: SQLite (better-sqlite3) for storing user preferences, recent files, formula history, and prediction cache.
- **File Management**: Open and save `.xlsx`, `.xls`, and `.csv` files.
- **Glassmorphism Design**: Modern, responsive dark mode design with frosted glass and glowing accents.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build & Package
```bash
npm run build
npm run package
```

### Running Tests
```bash
npm run test
```
