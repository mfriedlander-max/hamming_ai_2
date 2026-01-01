# Branch Task: feat/prompt-editor

**Status**: ✅ Completed
**Completed Date**: December 31, 2024

---

## Purpose
Build a diff viewer to review suggested changes, implement logic to apply accepted suggestions, and create new prompt versions.

---

## Checklist
- [x] Create DiffViewer component with side-by-side view
- [x] Build SuggestionPanel for managing suggestions
- [x] Implement diff applier logic
- [x] Create version management system
- [x] Build editor page with apply functionality
- [x] Handle multiple simultaneous suggestions
- [x] Detect and handle merge conflicts
- [x] Create new version on apply
- [x] Update audit log

---

## Key Files Created

### UI Components
- `/app/components/editor/DiffViewer.tsx` - Side-by-side diff display:
  - Original text on left
  - Modified text on right
  - Line-by-line highlighting
  - Syntax coloring for changes
- `/app/components/editor/SuggestionPanel.tsx` - Suggestion management:
  - Lists all suggestions
  - Shows accept/reject status
  - Count of accepted suggestions
  - Apply button
- `/app/app/projects/[id]/editor/page.tsx` - Editor page:
  - Loads analysis and suggestions
  - Displays diff viewer
  - Handles apply changes workflow

### Logic
- `/app/lib/diff/applier.ts` - Apply suggestions:
  - Merges accepted suggestions into prompt
  - Detects conflicts
  - Generates final merged text
  - Creates new PromptVersion

### Database Operations
- `/app/lib/db/versions.ts` - Version management:
  - createVersion()
  - getVersion()
  - getVersionsByProject()
  - getLatestVersion()

### Hooks
- `/app/lib/hooks/useVersions.ts` - Version management hook

---

## Diff Viewer Features

### Side-by-Side Display
- Left pane: Original prompt
- Right pane: Modified prompt with changes
- Synchronized scrolling
- Line number display

### Highlighting
- Green: Added lines
- Red: Removed lines
- Yellow: Modified lines
- Gray: Unchanged context

### Syntax
- Monospace font for code
- Word-level diff highlighting
- Preserved whitespace

---

## Suggestion Panel Features

### Display
- Lists all suggestions with reasons
- Shows accepted (green) and rejected (red) state
- Count badge: "3 accepted"
- Evidence preview on hover

### Actions
- **Accept**: Mark suggestion for application
- **Reject**: Dismiss suggestion
- **Apply Changes**: Apply all accepted suggestions

### Validation
- Disabled when no suggestions accepted
- Shows warning if suggestions conflict
- Confirms before applying

---

## Apply Logic

### Process
1. Load original prompt
2. Gather all accepted suggestions
3. Sort by line number (reverse order)
4. Apply each suggestion sequentially
5. Detect conflicts
6. Generate merged result
7. Create new PromptVersion
8. Log to audit trail

### Conflict Detection
- Checks if suggestions affect same lines
- Warns user before applying
- Allows manual resolution

### Merge Strategy
- Apply suggestions from bottom to top (preserves line numbers)
- Use diff patches for precision
- Validate final result

---

## Version Creation

### New Version Structure
```typescript
{
  id: nanoid(),
  projectId: string,
  versionNumber: incrementedNumber,
  content: mergedPrompt,
  createdAt: Date.now(),
  createdBy: 'user' | 'system',
  changedFrom: previousVersionId,
  appliedSuggestions: acceptedSuggestionIds[],
  changesSummary: "Applied 3 suggestions",
  analysisId: currentAnalysisId
}
```

### Immutability
- Previous versions never modified
- Full history preserved
- Rollback possible

---

## Verification

**Verified**:
- ✅ Diff viewer displays changes correctly
- ✅ Side-by-side view works
- ✅ Suggestions can be accepted/rejected
- ✅ Apply button creates new version
- ✅ Multiple suggestions merge correctly
- ✅ Conflicts are detected
- ✅ Version history is updated
- ✅ Audit log records application
- ✅ Rollback works from history page

---

## User Workflow

1. **View Results**: See analysis and suggestions on results page
2. **Navigate to Editor**: Click "Edit Prompt"
3. **Review Suggestions**: Read reasons and evidence
4. **Accept/Reject**: Choose which suggestions to apply
5. **Preview Changes**: See diff of proposed changes
6. **Apply**: Create new version with accepted suggestions
7. **View History**: Check version timeline

---

## Edge Cases Handled

- **No suggestions accepted**: Apply button disabled
- **Conflicting suggestions**: Warning displayed
- **Empty prompt**: Validation error
- **Large diffs**: Virtual scrolling for performance
- **Simultaneous edits**: Last write wins, full history preserved

---

## Notes

- Diff viewer uses `diff` library for accuracy
- Suggestions applied in reverse line order
- New version always increments version number
- changesSummary auto-generated from count
- Audit log captures all version creations
- Editor page refreshes after apply
- Previous versions accessible via history
