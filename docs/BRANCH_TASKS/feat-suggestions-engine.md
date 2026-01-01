# Branch Task: feat/suggestions-engine

**Status**: ✅ Completed
**Completed Date**: December 31, 2024

---

## Purpose
Generate AI-powered prompt edit suggestions based on failure categories, create diff patches, and build UI for reviewing suggestions with evidence.

---

## Checklist
- [x] Implement generateSuggestions() method in Claude client
- [x] Design suggestion generation prompt
- [x] Create diff generator using diff library
- [x] Implement suggestion storage in IndexedDB
- [x] Build SuggestionCard UI component
- [x] Display suggestions with reasons and evidence
- [x] Implement accept/reject functionality
- [x] Track suggestion status (pending/accepted/rejected)

---

## Key Files Created

### Suggestion Generation
- `/app/lib/api/claude.ts` - Updated with generateSuggestions():
  - Takes system prompt, category, and all tests
  - Returns structured suggestions with diffs
- `/app/lib/api/prompts.ts` - Suggestion generation prompt:
  - Instructs AI to create minimal, targeted edits
  - Requires reason + evidence for each suggestion

### Diff Logic
- `/app/lib/diff/generator.ts` - Diff generation:
  - Uses `diff` library for line-by-line comparison
  - Generates unified diff patches
  - Calculates line numbers for changes

### Database Operations
- `/app/lib/db/suggestions.ts` - Suggestion storage:
  - createSuggestion()
  - getSuggestion()
  - getSuggestionsByAnalysis()
  - updateSuggestionStatus()

### UI Components
- `/app/components/results/SuggestionCard.tsx` - Suggestion display:
  - Shows type (add/remove/replace)
  - Displays reason and proposed text
  - Lists linked test IDs
  - Shows evidence snippets
  - Accept/Reject buttons
- `/app/components/results/SuggestionsPanel.tsx` - Panel wrapper

---

## Suggestion Structure

```typescript
{
  id: string,
  analysisId: string,
  categoryId: string,
  type: 'add' | 'remove' | 'replace',
  targetSection?: string,
  originalText?: string,
  proposedText: string,
  reason: string,
  linkedTestIds: string[],
  evidence: EvidenceSnippet[],
  status: 'pending' | 'accepted' | 'rejected',
  reviewedAt?: number,
  diffPatch?: string,
  lineNumbers?: { start: number; end: number }
}
```

---

## Suggestion Types

### Add
- Adds new content to the prompt
- No original text
- Specifies where to add (section/position)

### Remove
- Removes existing content
- Has original text to remove
- Explains why removal improves prompt

### Replace
- Replaces existing text with new text
- Has both original and proposed text
- Most common type of suggestion

---

## Diff Generation

Uses the `diff` library to:
1. Compare original vs. proposed text
2. Generate unified diff patch
3. Calculate line numbers for changes
4. Highlight specific changes

Example diff:
```diff
- You must greet users warmly.
+ You must greet users warmly and professionally.
```

---

## Evidence Requirements

Each suggestion MUST include:
- **Reason**: Why this change will help (2-3 sentences)
- **Linked Tests**: Which failed tests this addresses
- **Evidence**: Specific transcript excerpts showing the problem

Example:
```
Reason: "The prompt doesn't specify professional tone, causing
informal responses. Adding this constraint will ensure consistent
business communication."

Linked Tests: ["test-42", "test-87"]

Evidence:
- Test test-42: "User: Hello\nBot: Yo what's up dude?"
- Test test-87: "User: How can I help?\nBot: Sup?"
```

---

## Accept/Reject Workflow

1. **Pending**: Initial state after generation
2. **User Reviews**: Sees reason, proposed change, evidence
3. **Accept**: Marks suggestion for application
4. **Reject**: Dismisses suggestion

Accepted suggestions are:
- Stored with `status: 'accepted'`
- Passed to diff applier
- Included in version history

Rejected suggestions are:
- Stored with `status: 'rejected'`
- Not applied to prompt
- Visible in audit trail

---

## Verification

**Verified**:
- ✅ Claude API generates appropriate suggestions
- ✅ Suggestions have clear reasons
- ✅ Evidence is linked correctly
- ✅ Diff patches are accurate
- ✅ Suggestion cards display all information
- ✅ Accept/reject buttons work
- ✅ Status updates persist in IndexedDB
- ✅ Multiple suggestions can be accepted
- ✅ Line numbers are calculated correctly

---

## API Usage

**generateSuggestions**:
```typescript
const suggestions = await claudeClient.generateSuggestions(
  systemPrompt,
  category,
  allTests
);
```

**Server Route**:
```typescript
POST /api/analyze
{
  action: "generate_suggestions",
  payload: {
    systemPrompt: string,
    category: FailureCategory,
    allTests: TestResult[]
  }
}
```

---

## Notes

- Suggestions are generated per category
- AI creates minimal, surgical edits
- All suggestions are traceable to evidence
- Users can accept multiple suggestions
- Diff patches use standard unified format
- Suggestions are immutable once created
- Status can be updated multiple times
