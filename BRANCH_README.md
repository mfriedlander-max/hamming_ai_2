# Branch: feat/analysis-engine

**Purpose**: Claude-powered failure analysis. Runs AI categorization on failed tests, extracts evidence, and displays analysis results.
**Scope**: Frontend + server route; depends on upload-ingest data model. Includes analysis UI, evidence display, and loading/empty states.
**Builds on**: feat/upload-ingest.
**What's included**:
- Claude client and `/api/analyze` route (analyze_failures).
- Dexie analysis storage and `useAnalysis` hook.
- AnalysisResults UI, category cards, evidence viewer, test linkage.
- Project detail page wired to run analysis; loading/empty states.

**Notes**: Downstream feature branches currently mirror this integrated state due to limited commit history; they should diverge as features are isolated later.
