import type { Analysis, Suggestion, PromptVersion, TestBatch } from "@/types";

export function generateChangeReport(
  analysis: Analysis,
  suggestions: Suggestion[],
  newVersion: PromptVersion,
  oldVersion: PromptVersion,
  testBatch: TestBatch
): string {
  const acceptedSuggestions = suggestions.filter(
    (s) => s.status === "accepted" || s.status === "applied"
  );
  const rejectedSuggestions = suggestions.filter(
    (s) => s.status === "rejected" || s.status === "rejected_applied"
  );

  const report = `# Prompt Engineering Analysis Report

## Summary

**Date**: ${new Date().toLocaleDateString()}
**Project**: Analysis ${analysis.id.substring(0, 8)}
**Model Used**: ${analysis.metadata.modelUsed}
**Analysis Duration**: ${(analysis.metadata.durationMs / 1000).toFixed(2)}s

### Test Results
- **Total Tests**: ${testBatch.totalTests}
- **Passed**: ${testBatch.passedTests} (${(
    (testBatch.passedTests / testBatch.totalTests) *
    100
  ).toFixed(1)}%)
- **Failed**: ${testBatch.failedTests} (${(
    (testBatch.failedTests / testBatch.totalTests) *
    100
  ).toFixed(1)}%)

### Changes Applied
- **Suggestions Accepted**: ${acceptedSuggestions.length}
- **Suggestions Rejected**: ${rejectedSuggestions.length}
- **Version**: ${oldVersion.versionNumber} → ${newVersion.versionNumber}

---

## Failure Categories

${analysis.categories
  .map(
    (category) => `### ${category.name} (${category.severity.toUpperCase()})

**Description**: ${category.description}

**Affected Tests**: ${category.affectedTestIds.length} test(s)

**Evidence**:
${category.evidence
  .map(
    (ev) => `- **Test ${ev.testId}**: "${ev.excerpt}"
  ${ev.context ? `  - *Context*: ${ev.context}` : ""}`
  )
  .join("\n")}
`
  )
  .join("\n")}

---

## Applied Changes

${
  acceptedSuggestions.length > 0
    ? acceptedSuggestions
        .map(
          (suggestion, idx) => `### Change ${idx + 1}: ${suggestion.type.toUpperCase()}

**Reason**: ${suggestion.reason}

**Addresses Tests**: ${suggestion.linkedTestIds.join(", ")}

${
  suggestion.originalText
    ? `**Original Text**:
\`\`\`
${suggestion.originalText}
\`\`\`
`
    : ""
}

**Proposed Text**:
\`\`\`
${suggestion.proposedText}
\`\`\`

**Evidence**:
${suggestion.evidence
  .map((ev) => `- Test ${ev.testId}: "${ev.excerpt}"`)
  .join("\n")}

---
`
        )
        .join("\n")
    : "*No changes were applied.*"
}

${
  rejectedSuggestions.length > 0
    ? `## Rejected Suggestions

${rejectedSuggestions
  .map((s) => `- ${s.type.toUpperCase()}: ${s.reason}`)
  .join("\n")}
`
    : ""
}

---

## Updated Prompt

\`\`\`
${newVersion.content}
\`\`\`

---

*Generated with PromptLab - Prompt Engineering Analysis Tool*
`;

  return report;
}

export function exportChangeReport(
  analysis: Analysis,
  suggestions: Suggestion[],
  newVersion: PromptVersion,
  oldVersion: PromptVersion,
  testBatch: TestBatch,
  filename: string
): void {
  const report = generateChangeReport(
    analysis,
    suggestions,
    newVersion,
    oldVersion,
    testBatch
  );
  const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
  downloadBlob(blob, `${filename}.md`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
