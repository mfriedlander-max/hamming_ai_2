# PromptLab - Prompt Engineering Analysis Tool

A clean, professional SaaS web application that analyzes test batches against system prompts and generates traceable, minimal prompt edit suggestions using AI.

**Status**: ✅ MVP Complete

---

## Branch Overview
- **feat/project-setup**: Baseline scaffold (Next.js, Tailwind, Dexie schema, types, base UI shell). Use as the clean reset point.
- **feat/upload-ingest**: Project creation, test batch upload/parsing (JSON/CSV/Excel), IndexedDB storage, dashboard/new project flow, empty/loading states.
- **feat/analysis-engine**: Claude-powered failure analysis (API route/client), analysis storage/hooks, analysis results UI. Downstream feature branches currently mirror this integrated baseline.
- **feat/suggestions-engine**: Placeholder; currently mirrors analysis baseline until suggestion-specific commits exist.
- **feat/prompt-editor**: Placeholder; currently mirrors analysis baseline until editor-specific commits exist.
- **feat/history-projects**: Placeholder; currently mirrors analysis baseline until history/version-specific commits exist.
- **feat/export**: Placeholder; currently mirrors analysis baseline until export-specific commits exist.
- **feat/ui-polish**: Placeholder; currently mirrors analysis baseline until UI polish commits exist.
- **feat/observability**: Placeholder; currently mirrors analysis baseline until observability commits exist.
- **dev**: Mirrors the integrated baseline (currently same as analysis). Future integration branch.
- **main**: Mirrors the integrated baseline (currently same as analysis). Production-ready once all features isolate.

> Note: Only two feature-bearing commits exist at the moment (project-setup and upload-ingest). All downstream branches are aligned to the integrated analysis baseline and will diverge when feature-specific work is isolated.

---

## What It Does

1. **Upload Test Batches**: Import test results in JSON, CSV, or Excel format
2. **AI Analysis**: Automatically categorize failures and identify patterns using Claude AI
3. **Get Suggestions**: Receive targeted, evidence-based prompt improvements
4. **Review Changes**: See side-by-side diffs of proposed edits
5. **Track Versions**: Maintain complete history of prompt evolution
6. **Export Everything**: Download prompts, analysis data, and comprehensive reports

---

## Key Features

### 🧪 Test Analysis
- Upload test batches (JSON/CSV/Excel)
- Automatic failure pattern detection
- Evidence extraction from test transcripts
- Severity-based categorization

### 🤖 AI-Powered Suggestions
- Claude API integration for intelligent analysis
- Minimal, surgical prompt edits
- Every suggestion backed by evidence
- Clear reasons for each change

### 📝 Prompt Editor
- Side-by-side diff viewer
- Accept/reject individual suggestions
- Preview changes before applying
- Conflict detection for overlapping edits

### 📊 Version Control
- Complete history of all prompt versions
- Compare any two versions
- Rollback to previous versions
- Immutable audit trail

### 📤 Export Options
- Prompts (.txt, .md)
- Analysis data (.json)
- Comprehensive change reports (.md)

### 🎨 Polished UI
- Responsive design (mobile, tablet, desktop)
- Loading skeletons
- Empty states with helpful guidance
- Toast notifications for user actions
- Smooth animations and transitions
- Full keyboard navigation
- Error boundaries

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Database**: IndexedDB (via Dexie.js)
- **AI**: Anthropic Claude API
- **File Parsing**: PapaParse (CSV), xlsx (Excel)
- **Diff**: diff library for precise change tracking

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd hamming_project_2
```

2. **Install dependencies**
```bash
cd app
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

4. **Run development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

---

## Project Structure

```
hamming_project_2/
├── app/                          # Next.js application
│   ├── app/                      # App router pages
│   │   ├── dashboard/           # Projects dashboard
│   │   ├── projects/
│   │   │   ├── new/            # Create project + upload
│   │   │   └── [id]/           # Project detail pages
│   │   └── api/                # Server-side API routes
│   ├── components/
│   │   ├── ui/                 # Shadcn base components
│   │   ├── analysis/           # Analysis UI components
│   │   ├── editor/             # Prompt editor
│   │   ├── history/            # Version history
│   │   ├── loading/            # Skeleton screens
│   │   └── empty/              # Empty states
│   ├── lib/
│   │   ├── db/                 # IndexedDB (Dexie)
│   │   ├── api/                # Claude API client
│   │   ├── parsers/            # File parsers
│   │   ├── diff/               # Diff generation
│   │   ├── export/             # Export utilities
│   │   └── hooks/              # React hooks
│   └── types/                  # TypeScript types
├── docs/                        # Documentation
│   ├── PLAN.md                 # Original plan
│   ├── IMPLEMENTATION_STATUS.md # Current status
│   └── BRANCH_TASKS/           # Per-feature docs
└── README.md                   # This file
```

---

## Usage Guide

### 1. Create a Project

1. Click "New Analysis" from the dashboard
2. Enter a project name
3. Paste your system prompt
4. Upload a test batch file (JSON/CSV/Excel)
5. Click "Create Project"

### 2. Review Analysis

- View failure categories organized by severity
- See evidence extracted from test transcripts
- Click "Generate Suggestions" for each category

### 3. Apply Suggestions

1. Navigate to "Edit Prompt"
2. Review each suggestion with its reason and evidence
3. Accept or reject suggestions
4. Preview changes in the diff viewer
5. Click "Apply Changes" to create a new version

### 4. Track History

- Visit "View History" to see all versions
- Compare any two versions
- Rollback to a previous version if needed
- View complete audit trail of all actions

### 5. Export Results

- Export prompts in .txt or .md format
- Export analysis data as JSON
- Download comprehensive change reports

---

## Test Batch Format

### JSON
```json
{
  "tests": [
    {
      "id": "test-1",
      "status": "fail",
      "transcript": "User: Hello\nBot: [Error]",
      "expectedBehavior": "Greeting response",
      "actualBehavior": "Error thrown",
      "metadata": {}
    }
  ]
}
```

### CSV
```csv
id,status,transcript,expectedBehavior,actualBehavior
test-1,fail,"User: Hello\nBot: [Error]",Greeting response,Error thrown
```

### Excel
- First row: Column headers
- Same columns as CSV

---

## Development

### Build for Production
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

---

## Architecture Decisions

### Why IndexedDB?
- Client-side storage (no backend needed)
- Large storage capacity
- Structured data with indexes
- Full offline capability

### Why No Authentication?
- MVP focused on core functionality
- Local-only data (privacy by design)
- Easy to add later if needed

### Why Claude API?
- Best-in-class reasoning for prompt analysis
- Structured output support
- Excellent instruction following
- Handles complex prompt engineering tasks

---

## Roadmap

### Completed ✅
- [x] File upload (JSON/CSV/Excel)
- [x] AI-powered failure analysis
- [x] Suggestion generation with evidence
- [x] Diff-based prompt editor
- [x] Version control and history
- [x] Export functionality
- [x] Polished UI with animations
- [x] Responsive design
- [x] Accessibility improvements

### Future Enhancements (Optional)
- [ ] Observability (debug panel, logging)
- [ ] Multi-project comparison
- [ ] Advanced filtering and search
- [ ] Collaboration features (import/export)
- [ ] Custom AI models support
- [ ] Streaming AI responses
- [ ] Performance optimizations for large batches

---

## Documentation

- **[PLAN.md](docs/PLAN.md)** - Original implementation plan
- **[IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md)** - Detailed status of all features
- **[BRANCH_TASKS/](docs/BRANCH_TASKS/)** - Per-feature documentation

---

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Edge | ✅ Full |
| Mobile (iOS/Android) | ✅ Responsive |

---

## Contributing

This is an MVP project. Future contributions would be welcomed for:
- Additional file format support
- UI/UX improvements
- Performance optimizations
- Documentation improvements

---

## License

[To be determined]

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/)
- Icons from [Lucide](https://lucide.dev/)

---

## Support

For issues or questions:
1. Check the [documentation](docs/)
2. Review [implementation status](docs/IMPLEMENTATION_STATUS.md)
3. Create an issue in the repository

---

**Built with ❤️ and Claude AI**
