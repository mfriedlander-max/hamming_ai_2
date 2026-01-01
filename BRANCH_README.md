# Branch: feat/upload-ingest

**Purpose**: File upload & ingestion: project creation, test batch upload (JSON/CSV/Excel), parsing/validation, and basic dashboard/new project flow.
**Scope**: Frontend (App Router) with IndexedDB persistence for projects and test batches.
**Builds on**: feat/project-setup.
**What’s included**:
- Parsers for JSON/CSV/Excel → normalized TestResult[].
- Project & test batch Dexie helpers and `useProjects` hook.
- Upload UI (drag-drop), prompt input, dashboard listing, new project flow, empty/loading states for projects.

**Notes**: This branch is feature-scoped to upload/ingest only. No analysis/suggestions/history UI here. Use as base for analysis-engine.
