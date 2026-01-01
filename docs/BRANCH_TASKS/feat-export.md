# Branch Task: feat/export

**Status**: ✅ Completed
**Completed Date**: December 31, 2024

---

## Purpose
Implement export functionality for prompts, analysis data, and comprehensive change reports in multiple formats.

---

## Checklist
- [x] Create prompt export utility (txt, md)
- [x] Create analysis JSON export
- [x] Create change report generator (md)
- [x] Build ExportDialog component
- [x] Add export buttons to results page
- [x] Add export buttons to editor page
- [x] Add export buttons to history page
- [x] Generate comprehensive markdown reports
- [x] Include metadata in exports

---

## Key Files Created

### Export Utilities
- `/app/lib/export/prompt.ts` - Export prompts:
  - exportPrompt(content, filename, format)
  - Formats: .txt, .md
  - Downloads to user's computer
- `/app/lib/export/analysis.ts` - Export analysis:
  - exportAnalysisJSON(analysis, testBatch, filename)
  - Complete analysis data as JSON
- `/app/lib/export/report.ts` - Generate reports:
  - generateChangeReport(...)
  - exportChangeReport(...)
  - Comprehensive markdown with all changes

### UI Components
- `/app/components/export/ExportDialog.tsx` - Format selection dialog:
  - Radio group for format selection
  - Supports txt, md, json
  - Reusable across pages
- `/app/components/ui/radio-group.tsx` - Shadcn radio component

---

## Export Formats

### Prompt Export (.txt, .md)
**Contents**:
- Raw prompt text
- No formatting (txt) or markdown formatting (md)

**Usage**:
- Results page: Export original prompt
- Editor page: Export modified prompt
- History page: Export specific version

**Example**:
```
You are a helpful assistant...
[full prompt text]
```

### Analysis Export (.json)
**Contents**:
```json
{
  "analysis": {
    "id": "...",
    "systemPrompt": "...",
    "analyzedAt": 1704067200000,
    "categories": [...],
    "metadata": {...}
  },
  "testBatch": {
    "id": "...",
    "fileName": "tests.json",
    "totalTests": 50,
    "passedTests": 35,
    "failedTests": 15,
    "tests": [...]
  }
}
```

**Usage**:
- Results page: "Export Analysis" button
- Backup analysis results
- Share with team
- Import to other tools

### Change Report (.md)
**Contents**:
1. **Summary**
   - Date generated
   - Project identifier
   - Model used
   - Analysis duration

2. **Test Results**
   - Total tests
   - Pass/fail breakdown
   - Percentages

3. **Changes Applied**
   - Number of suggestions accepted/rejected
   - Version transition (v1 → v2)

4. **Failure Categories**
   - Each category with:
     - Name and severity
     - Description
     - Affected test count
     - Evidence snippets

5. **Applied Changes**
   - Each suggestion with:
     - Type (add/remove/replace)
     - Reason for change
     - Test IDs addressed
     - Original text (if applicable)
     - Proposed text
     - Evidence

6. **Rejected Suggestions**
   - List of rejected suggestions with reasons

7. **Updated Prompt**
   - Full text of new prompt version

**Usage**:
- Editor page: After applying suggestions
- History page: For any version transition
- Documentation
- Stakeholder reports

---

## Export Locations

### Results Page
- **Export Prompt** (txt/md): Original prompt before changes
- **Export Analysis** (json): Full analysis data

### Editor Page
- **Export** (txt/md): Current modified prompt
- **Export Report** (md): Change report after applying suggestions

### History Page
- **Export Latest Prompt** (txt/md): Most recent version
- **Export Report** (md): Change report for latest version

---

## Change Report Example

```markdown
# Prompt Engineering Analysis Report

## Summary

**Date**: December 31, 2024
**Project**: Analysis abc12345
**Model Used**: claude-sonnet-4-20250514
**Analysis Duration**: 3.45s

### Test Results
- **Total Tests**: 50
- **Passed**: 35 (70.0%)
- **Failed**: 15 (30.0%)

### Changes Applied
- **Suggestions Accepted**: 3
- **Suggestions Rejected**: 1
- **Version**: 1 → 2

---

## Failure Categories

### Tone Issues (HIGH)

**Description**: Responses lack professional tone

**Affected Tests**: 8 test(s)

**Evidence**:
- **Test test-42**: "User: Hello\nBot: Yo what's up dude?"
  - *Context*: Informal greeting instead of professional

---

## Applied Changes

### Change 1: REPLACE

**Reason**: The prompt doesn't specify professional tone...

**Addresses Tests**: test-42, test-87

**Original Text**:
```
You must greet users warmly.
```

**Proposed Text**:
```
You must greet users warmly and professionally.
```

**Evidence**:
- Test test-42: "Yo what's up dude?"
- Test test-87: "Sup?"

---

## Updated Prompt

```
You are a helpful assistant...
[full updated prompt]
```

---

*Generated with PromptLab - Prompt Engineering Analysis Tool*
```

---

## Implementation Details

### Download Function
```typescript
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

### File Naming
- Prompts: `prompt-v{versionNumber}.{ext}`
- Analysis: `analysis-{timestamp}.json`
- Reports: `change-report-v{versionNumber}.md`

---

## Verification

**Verified**:
- ✅ Prompt exports download correctly (txt, md)
- ✅ Analysis JSON exports with complete data
- ✅ Change reports include all sections
- ✅ Export dialog shows format options
- ✅ File names are descriptive
- ✅ Markdown formatting is correct
- ✅ Evidence and suggestions included
- ✅ Export buttons visible on all pages
- ✅ Toast notifications show on export

---

## Notes

- All exports are client-side (no server upload)
- Files download immediately to user's device
- Markdown reports are human-readable
- JSON exports are machine-parseable
- Export functions integrated with audit logging
- Toast notifications confirm successful exports
- Format selection dialog is reusable component
