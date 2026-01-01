# Branch Task: feat/analysis-engine

**Status**: ✅ Completed
**Completed Date**: December 31, 2024

---

## Purpose
Integrate Anthropic Claude API to analyze failed tests, categorize failure patterns, extract evidence snippets, and display results.

---

## Checklist
- [x] Create Claude API client wrapper
- [x] Design analysis system prompt
- [x] Implement server-side API route
- [x] Create analyzeFailures() method
- [x] Implement failure categorization logic
- [x] Extract evidence snippets from transcripts
- [x] Store analysis results in IndexedDB
- [x] Build AnalysisResults UI component
- [x] Display failure categories with evidence
- [x] Configure environment variable for API key

---

## Key Files Created

### API Integration
- `/app/lib/api/claude.ts` - Claude API client class:
  - analyzeFailures(systemPrompt, failedTests)
  - generateSuggestions(systemPrompt, category, allTests)
- `/app/lib/api/prompts.ts` - System prompts for AI:
  - Analysis prompt for categorization
  - Suggestion generation prompt
- `/app/app/api/analyze/route.ts` - Server-side API proxy:
  - POST endpoint with actions: analyze_failures, generate_suggestions
  - Keeps API key secure server-side

### Database Operations
- `/app/lib/db/analyses.ts` - Analysis storage:
  - createAnalysis()
  - getAnalysis()
  - getAnalysesByProject()

### UI Components
- `/app/components/analysis/AnalysisResults.tsx` - Results display
- `/app/components/results/CategoryCard.tsx` - Failure category cards
- `/app/components/results/EvidenceViewer.tsx` - Evidence display
- `/app/app/projects/[id]/page.tsx` - Project results page

---

## API Configuration

### Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Model Used
- **claude-sonnet-4-20250514** - High-quality analysis and suggestion generation

---

## Analysis Prompt Strategy

### Input
- System prompt being tested
- Array of failed test results with transcripts

### Output (Structured JSON)
```typescript
{
  categories: [
    {
      id: string,
      name: string,
      description: string,
      severity: 'high' | 'medium' | 'low',
      affectedTestIds: string[],
      evidence: [
        {
          testId: string,
          excerpt: string,
          context?: string
        }
      ],
      count: number
    }
  ]
}
```

### Validation
- Zod schema validates all AI responses
- Error handling for malformed responses
- Fallback error messages

---

## Categorization Logic

The AI categorizes failures based on:
1. **Pattern Recognition**: Similar error types
2. **Root Cause Analysis**: Underlying issues
3. **Severity Assessment**: Impact on functionality
4. **Evidence Extraction**: Specific transcript excerpts

Categories are automatically:
- Named descriptively
- Ranked by severity
- Linked to specific test IDs
- Backed by evidence snippets

---

## Evidence Extraction

Each category includes:
- **Test ID**: Which test failed
- **Excerpt**: Relevant portion of transcript
- **Context**: Why this excerpt is significant
- **Highlight**: Optional character positions

Evidence is displayed in the UI with:
- Syntax highlighting
- Expandable context
- Links to full transcripts

---

## Verification

**Verified**:
- ✅ Claude API connection works
- ✅ Analysis prompt generates categories correctly
- ✅ Evidence snippets are extracted accurately
- ✅ Severity levels are assigned appropriately
- ✅ Results are stored in IndexedDB
- ✅ UI displays categories with evidence
- ✅ Error handling works for API failures
- ✅ Zod validation catches malformed responses

---

## API Usage

**analyzeFailures**:
```typescript
const categories = await claudeClient.analyzeFailures(
  systemPrompt,
  failedTests
);
```

**Server Route**:
```typescript
POST /api/analyze
{
  action: "analyze_failures",
  payload: {
    systemPrompt: string,
    failedTests: TestResult[]
  }
}
```

---

## Notes

- API key stored server-side for security
- Analysis runs asynchronously with loading state
- Results are cached in IndexedDB
- Each analysis is tied to a test batch
- Categories are sorted by severity (high → low)
- Evidence snippets are limited to 200 characters
- Full transcripts available on click
