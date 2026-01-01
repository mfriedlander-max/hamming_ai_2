# Branch: feat/upload-ingest

**Status**: ✅ Complete
**Purpose**: File upload, parsing (JSON/CSV/Excel), and project management
**Builds On**: feat/project-setup

---

## What This Branch Adds

This branch builds on the foundation and adds:

### File Parsing
- **JSON Parser** (`/app/lib/parsers/json.ts`):
  - Validates test batch structure with Zod
  - Normalizes to TestResult[]
- **CSV Parser** (`/app/lib/parsers/csv.ts`):
  - PapaParse integration
  - Column mapping to test format
- **Excel Parser** (`/app/lib/parsers/excel.ts`):
  - xlsx library integration
  - Multi-sheet support

### Project Management
- **Database Operations** (`/app/lib/db/projects.ts`, `/app/lib/db/testBatches.ts`):
  - Create/read/update/delete projects
  - Store test batches in IndexedDB
  - Link test batches to projects
- **Project Hook** (`/app/lib/hooks/useProjects.ts`):
  - React hook for project CRUD operations

### UI Components
- **Upload Component** (`/app/components/analysis/UploadTestBatch.tsx`):
  - Drag-and-drop file upload
  - File validation
  - Parsing progress indicators
- **Prompt Input** (`/app/components/analysis/PromptInput.tsx`):
  - Textarea for system prompt entry
- **Dashboard** (`/app/app/dashboard/page.tsx`):
  - List all projects
  - Create new project button
- **New Project Page** (`/app/app/projects/new/page.tsx`):
  - Upload test batch
  - Enter system prompt
  - Create project workflow
- **Empty States** (`/app/components/empty/EmptyProjects.tsx`):
  - No projects yet state
- **Loading States** (`/app/components/loading/ProjectSkeleton.tsx`):
  - Skeleton for project cards

### Schemas
- **Test Batch Schema** (`/app/schemas/test-batch.schema.json`):
  - JSON schema for validation

---

## Key Files Added

**Parsers:**
- `/app/lib/parsers/index.ts` - Parser dispatcher
- `/app/lib/parsers/json.ts` - JSON parser
- `/app/lib/parsers/csv.ts` - CSV parser with PapaParse
- `/app/lib/parsers/excel.ts` - Excel parser with xlsx

**Database:**
- `/app/lib/db/projects.ts` - Project CRUD operations
- `/app/lib/db/testBatches.ts` - Test batch CRUD operations

**Components:**
- `/app/components/analysis/UploadTestBatch.tsx` - File upload
- `/app/components/analysis/PromptInput.tsx` - Prompt input
- `/app/app/dashboard/page.tsx` - Dashboard
- `/app/app/projects/new/page.tsx` - Create project

**Hooks:**
- `/app/lib/hooks/useProjects.ts` - Project management hook

---

## Dependencies Added

```json
{
  "papaparse": "^5.4.1",
  "xlsx": "^0.18.5",
  "react-dropzone": "^14.2.3"
}
```

---

## What This Branch Enables

✅ Upload test batches (JSON, CSV, Excel)
✅ Parse test files into structured format
✅ Create and manage projects
✅ Store projects in IndexedDB
✅ View project dashboard
✅ Input system prompts

❌ No AI analysis yet
❌ No suggestions yet
❌ No diff viewer yet

---

## Running This Branch

```bash
git checkout feat/upload-ingest
cd app
npm install
npm run dev
```

Visit `/dashboard` to create projects and upload test batches.

---

## Next Steps

**feat/analysis-engine** will add:
- Claude API client
- AI-powered failure categorization
- Evidence extraction
- Analysis results display

---

See `/docs/BRANCH_TASKS/feat-upload-ingest.md` for detailed implementation notes.
