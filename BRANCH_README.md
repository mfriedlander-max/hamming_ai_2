# Branch: feat/upload-ingest

**Purpose**: Upload and ingestion feature branch; currently aligned to the integrated baseline (includes upload, analysis, and UI from main).
**Scope**: Full app feature set through the analysis baseline; retains upload/ingest focus and IndexedDB persistence for projects and test batches.
**Builds on**: feat/project-setup.
**What’s included**:
- Parsers for JSON/CSV/Excel → normalized TestResult[].
- Project & test batch Dexie helpers and `useProjects` hook.
- Upload UI (drag-drop), prompt input, dashboard listing, new project flow, empty/loading states.
- Analysis engine and integrated UI from main (temporary alignment).

**Notes**: Mirrors main for now; will diverge if upload-specific changes are isolated later.
