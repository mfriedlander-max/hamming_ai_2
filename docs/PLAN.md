# Implementation Plan: Prompt Engineering SaaS

## Overview

**Product**: A clean, Apple-ish SaaS web app that analyzes test batches against system prompts and generates traceable, minimal prompt edit suggestions.

**Tech Stack**:
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Shadcn/ui
- **AI**: Anthropic Claude API for analysis and suggestion generation
- **Storage**: IndexedDB (Dexie.js) - client-side only, no backend
- **Auth**: None (local-only MVP)

**Core Principles**:
- Every suggestion MUST have: reason + linked test(s) + evidence snippet
- Small targeted patches, not full rewrites
- Full auditability via version history and audit trail

---

## Project Structure

```
hamming_project_2/
├── app/                          # Next.js app
│   ├── app/                      # App router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Landing
│   │   ├── dashboard/
│   │   ├── projects/
│   │   │   ├── new/             # Upload tests + prompt
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Results
│   │   │       ├── editor/      # Prompt editor
│   │   │       └── history/     # Version history
│   │   └── api/
│   │       └── analyze/route.ts
│   ├── components/
│   │   ├── ui/                  # Shadcn base components
│   │   ├── layout/
│   │   ├── projects/
│   │   ├── analysis/
│   │   ├── results/
│   │   ├── editor/
│   │   ├── history/
│   │   └── export/
│   ├── lib/
│   │   ├── db/                  # IndexedDB (Dexie)
│   │   ├── api/                 # Claude API client
│   │   ├── parsers/             # JSON/CSV/Excel
│   │   ├── analysis/            # Categorization, evidence
│   │   ├── diff/                # Diff generation & application
│   │   ├── export/
│   │   ├── utils/
│   │   └── hooks/
│   └── types/                   # TypeScript definitions
├── docs/
│   ├── PLAN.md
│   ├── DECISIONS.md
│   └── BRANCH_TASKS/            # One file per branch
└── schemas/                      # JSON schemas for validation
```

---

## Data Models

### Core Types

**Project**
```typescript
{
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  currentPromptVersion: string;
  tags?: string[];
}
```

**TestBatch**
```typescript
{
  id: string;
  projectId: string;
  uploadedAt: number;
  fileName: string;
  fileType: 'json' | 'csv' | 'excel';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  tests: TestResult[];
}

TestResult = {
  id: string;
  status: 'pass' | 'fail';
  transcript: string;
  metadata?: Record<string, any>;
  expectedBehavior?: string;
  actualBehavior?: string;
}
```

**Analysis**
```typescript
{
  id: string;
  projectId: string;
  testBatchId: string;
  systemPrompt: string;
  analyzedAt: number;
  categories: FailureCategory[];
  metadata: {
    modelUsed: string;
    tokensUsed?: number;
    durationMs: number;
  };
}

FailureCategory = {
  id: string;
  name: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  affectedTestIds: string[];
  evidence: EvidenceSnippet[];
  count: number;
}

EvidenceSnippet = {
  testId: string;
  excerpt: string;
  highlightStart?: number;
  highlightEnd?: number;
  context?: string;
}
```

**Suggestion**
```typescript
{
  id: string;
  analysisId: string;
  categoryId: string;
  type: 'add' | 'remove' | 'replace';
  targetSection?: string;
  originalText?: string;
  proposedText: string;
  reason: string;
  linkedTestIds: string[];
  evidence: EvidenceSnippet[];
  status: 'pending' | 'accepted' | 'rejected';
  reviewedAt?: number;
  diffPatch?: string;
  lineNumbers?: { start: number; end: number; };
}
```

**PromptVersion**
```typescript
{
  id: string;
  projectId: string;
  versionNumber: number;
  content: string;
  createdAt: number;
  createdBy: 'user' | 'system';
  changedFrom?: string;
  appliedSuggestions?: string[];
  changesSummary?: string;
  analysisId?: string;
}
```

---

## Branch Strategy & Sequencing

### Branch Dependencies
```
main
 └── dev
      └── feat/project-setup (FIRST)
           └── feat/upload-ingest
                ├── feat/analysis-engine
                │    └── feat/suggestions-engine
                │         └── feat/prompt-editor
                │              ├── feat/history-projects
                │              ├── feat/export
                │              └── feat/ui-polish
                └── feat/observability (parallel)
```

### Implementation Order

1. **feat/project-setup** - Foundation
2. **feat/upload-ingest** - File parsing + project management
3. **feat/analysis-engine** - Claude API integration + categorization
4. **feat/suggestions-engine** - Suggestion generation + diff logic
5. **feat/prompt-editor** - Diff viewer + accept/reject + version creation
6. **feat/history-projects** - Version timeline + audit trail
7. **feat/export** - Download prompts + change reports
8. **feat/ui-polish** - Design system, animations, responsive
9. **feat/observability** - Logging + debug panel

---

## Key Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "tailwindcss": "^3.4.0",

    // Shadcn/ui ecosystem
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "lucide-react": "^0.344.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",

    // Data & State
    "dexie": "^4.0.1",
    "dexie-react-hooks": "^1.1.7",
    "zustand": "^4.5.0",

    // AI & Parsing
    "@anthropic-ai/sdk": "^0.20.0",
    "papaparse": "^5.4.1",
    "xlsx": "^0.18.5",

    // Diff & Utils
    "diff": "^5.2.0",
    "zod": "^3.22.4",
    "nanoid": "^5.0.5",
    "react-dropzone": "^14.2.3",
    "date-fns": "^3.3.0"
  }
}
```

---

## Critical Implementation Details

### 1. Claude API Integration

**File**: `/app/lib/api/claude.ts`

```typescript
export class ClaudeAPIClient {
  async analyzeFailures(
    systemPrompt: string,
    failedTests: TestResult[]
  ): Promise<FailureCategory[]>;

  async generateSuggestions(
    systemPrompt: string,
    category: FailureCategory,
    allTests: TestResult[]
  ): Promise<Suggestion[]>;
}
```

**File**: `/app/api/analyze/route.ts`
- Server-side API route to keep API key secure
- Proxies calls to Claude API
- Actions: `analyze_failures`, `generate_suggestions`

**Prompt Engineering Strategy**:
- **Analysis Prompt**: Categorize failures, extract evidence snippets
- **Suggestion Prompt**: Generate minimal, surgical edits with reasoning
- Both return structured JSON validated with Zod schemas

### 2. IndexedDB Schema

**File**: `/app/lib/db/client.ts`

```typescript
export class AppDatabase extends Dexie {
  projects!: Table<Project>;
  testBatches!: Table<TestBatch>;
  analyses!: Table<Analysis>;
  suggestions!: Table<Suggestion>;
  versions!: Table<PromptVersion>;
  auditLog!: Table<AuditEntry>;
}

export const db = new AppDatabase();
```

### 3. File Parsing

**Files**:
- `/app/lib/parsers/json.ts` - Zod validation for JSON test batches
- `/app/lib/parsers/csv.ts` - PapaParse for CSV
- `/app/lib/parsers/excel.ts` - xlsx library for Excel files

All parsers normalize to `TestResult[]` array.

### 4. Diff Generation & Application

**File**: `/app/lib/diff/generator.ts`
- Uses `diff` library to generate minimal patches
- Creates line-by-line diffs for UI display

**File**: `/app/lib/diff/applier.ts`
- Applies accepted suggestions to prompt
- Detects conflicts when multiple suggestions affect same lines
- Creates new PromptVersion after successful merge

### 5. UI Component Architecture

**Key Components**:
- **DiffViewer** (`/app/components/editor/DiffViewer.tsx`) - Side-by-side diff with syntax highlighting
- **SuggestionCard** (`/app/components/results/SuggestionCard.tsx`) - Shows reason, linked tests, evidence
- **UploadTestBatch** (`/app/components/analysis/UploadTestBatch.tsx`) - Drag-drop upload with react-dropzone
- **VersionTimeline** (`/app/components/history/VersionTimeline.tsx`) - Version history with diff comparisons
- **EvidenceViewer** (`/app/components/results/EvidenceViewer.tsx`) - Highlighted transcript excerpts

---

## Risk Mitigation

### High-Risk Areas

**1. Claude API Response Parsing**
- Use strict Zod schemas for validation
- Store raw responses for debugging
- Retry with clarified prompts on failure
- Fallback to manual categorization UI

**2. Diff Merging Conflicts**
- Use battle-tested `diff` library
- Validate merged result before saving
- Always preserve previous version (immutable history)
- Conflict detection UI with manual resolution

**3. IndexedDB Browser Limits**
- Check storage quota before large writes
- Clear error messages for quota exceeded
- Export/import for data portability
- Test on Chrome, Firefox, Safari

**4. Large Test Batches**
- Batch processing for large sets
- Token counting before API calls
- Warn if exceeding limits
- Virtual scrolling in UI

**5. Evidence Extraction Accuracy**
- Fuzzy matching to verify evidence in transcripts
- Highlight exact matches in UI
- Allow user to flag inaccurate evidence

---

## Critical Files to Create

### Architectural Backbone

1. **`/app/lib/db/client.ts`** - IndexedDB schema and Dexie client; all persistence flows through this
2. **`/app/lib/api/claude.ts`** - Claude API wrapper; handles all AI analysis
3. **`/app/lib/api/prompts.ts`** - System prompts for analysis and suggestions; critical for output quality
4. **`/app/types/index.ts`** - Complete TypeScript type definitions; ensures type safety
5. **`/app/lib/diff/applier.ts`** - Applies suggestions and generates new versions; handles merge logic

### Per-Branch Critical Files

**feat/project-setup**:
- `/app/package.json`
- `/app/app/layout.tsx`
- `/app/lib/db/client.ts`
- `/app/types/index.ts`

**feat/upload-ingest**:
- `/app/lib/parsers/*.ts` (json, csv, excel)
- `/app/components/analysis/UploadTestBatch.tsx`
- `/app/lib/db/projects.ts`

**feat/analysis-engine**:
- `/app/lib/api/claude.ts`
- `/app/lib/api/prompts.ts`
- `/app/api/analyze/route.ts`
- `/app/components/analysis/AnalysisResults.tsx`

**feat/suggestions-engine**:
- `/app/lib/analysis/suggester.ts`
- `/app/lib/diff/generator.ts`
- `/app/components/results/SuggestionCard.tsx`

**feat/prompt-editor**:
- `/app/components/editor/DiffViewer.tsx`
- `/app/lib/diff/applier.ts`
- `/app/lib/db/versions.ts`

**feat/history-projects**:
- `/app/components/history/VersionTimeline.tsx`
- `/app/lib/db/auditLog.ts`

**feat/export**:
- `/app/lib/export/prompt.ts`
- `/app/lib/export/report.ts`

---

## Workflow: Claude (Planner) + Codex (Builder)

### For Each Branch

**Claude's Role**:
1. Define branch scope + acceptance criteria
2. Generate **Codex Task Pack** (copy/paste markdown with detailed specs)
3. User runs Codex to implement
4. User reports "Codex done"
5. Claude verifies against acceptance criteria
6. Only then mark complete and move to next branch

**Codex Task Pack Format** (4 sections):
- **Section A**: Branch overview (name, purpose, inputs/outputs)
- **Section B**: Checklist (discrete deliverables)
- **Section C**: Task pack (files to create, step-by-step tasks, data contracts, UI requirements, edge cases, acceptance criteria, test steps)
- **Section D**: Verification rubric (what Claude will check)

---

## Next Steps

1. **Claude**: Generate Codex Task Pack for `feat/project-setup`
2. **User**: Paste to Codex, let it scaffold the project
3. **User**: Report "Codex done with project-setup"
4. **Claude**: Verify setup (app runs, types compile, IndexedDB initializes)
5. **Repeat** for each subsequent branch in order
