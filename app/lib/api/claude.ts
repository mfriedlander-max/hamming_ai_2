import Anthropic from "@anthropic-ai/sdk";
import type { TestResult, FailureCategory } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export interface AnalysisResponse {
  categories: Array<{
    name: string;
    description: string;
    severity: "high" | "medium" | "low";
    affectedTestIds: string[];
    evidence: Array<{
      testId: string;
      excerpt: string;
      context?: string;
    }>;
  }>;
}

export interface SuggestionResponse {
  suggestions: Array<{
    type: "add" | "remove" | "replace";
    targetSection?: string;
    originalText?: string;
    proposedText: string;
    reason: string;
    linkedTestIds: string[];
  }>;
}

export class ClaudeAPIClient {
  async analyzeFailures(
    systemPrompt: string,
    failedTests: TestResult[]
  ): Promise<FailureCategory[]> {
    const analysisPrompt = this.buildAnalysisPrompt(systemPrompt, failedTests);

    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type from Claude");
      }

      const parsed = this.parseAnalysisResponse(content.text);
      return this.normalizeCategories(parsed, failedTests);
    } catch (error: any) {
      console.error("Claude API error:", error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  async generateSuggestions(
    systemPrompt: string,
    category: FailureCategory,
    allTests: TestResult[]
  ): Promise<SuggestionResponse> {
    const suggestionPrompt = this.buildSuggestionPrompt(
      systemPrompt,
      category,
      allTests
    );

    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: suggestionPrompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type from Claude");
      }

      return this.parseSuggestionResponse(content.text);
    } catch (error: any) {
      console.error("Claude API error:", error);
      throw new Error(`Suggestion generation failed: ${error.message}`);
    }
  }

  private buildAnalysisPrompt(
    systemPrompt: string,
    failedTests: TestResult[]
  ): string {
    const testsJSON = JSON.stringify(
      failedTests.map((t) => ({
        id: t.id,
        transcript: t.transcript,
        expectedBehavior: t.expectedBehavior,
        actualBehavior: t.actualBehavior,
      })),
      null,
      2
    );

    return `You are an expert prompt engineer analyzing test failures.

## System Prompt Being Analyzed:
\`\`\`
${systemPrompt}
\`\`\`

## Failed Test Cases:
\`\`\`json
${testsJSON}
\`\`\`

## Task:
Analyze these failures and categorize them into common root causes.

For each category:
1. Provide a clear name (e.g., "Instruction Following", "Tone Misalignment")
2. Write a description of the issue
3. Assess severity (high/medium/low)
4. List affected test IDs
5. Extract evidence snippets from transcripts (exact quotes showing the issue)

## Output Format (JSON):
\`\`\`json
{
  "categories": [
    {
      "name": "Category Name",
      "description": "Clear description of the issue",
      "severity": "high" | "medium" | "low",
      "affectedTestIds": ["test-1", "test-2"],
      "evidence": [
        {
          "testId": "test-1",
          "excerpt": "Exact quote from transcript showing the issue",
          "context": "Why this is problematic"
        }
      ]
    }
  ]
}
\`\`\`

Be specific and evidence-based. Every category must have concrete evidence from transcripts.`;
  }

  private parseAnalysisResponse(text: string): AnalysisResponse {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    try {
      const parsed = JSON.parse(jsonText);
      return parsed as AnalysisResponse;
    } catch (error) {
      console.error("Failed to parse Claude response:", text);
      throw new Error("Failed to parse analysis response");
    }
  }

  private normalizeCategories(
    response: AnalysisResponse,
    failedTests: TestResult[]
  ): FailureCategory[] {
    return response.categories.map((cat, index) => ({
      id: `category-${index}`,
      name: cat.name,
      description: cat.description,
      severity: cat.severity,
      affectedTestIds: cat.affectedTestIds,
      evidence: cat.evidence.map((ev) => ({
        testId: ev.testId,
        excerpt: ev.excerpt,
        context: ev.context,
      })),
      count: cat.affectedTestIds.length,
    }));
  }

  private buildSuggestionPrompt(
    systemPrompt: string,
    category: FailureCategory,
    allTests: TestResult[]
  ): string {
    const failedTests = allTests.filter((t) =>
      category.affectedTestIds.includes(t.id)
    );
    const passedTests = allTests.filter((t) => t.status === "pass");

    return `You are an expert prompt engineer suggesting targeted improvements.

## Current System Prompt:
\`\`\`
${systemPrompt}
\`\`\`

## Failure Category to Address:
**${category.name}** (Severity: ${category.severity})
${category.description}

## Evidence from Failed Tests:
${category.evidence
  .map(
    (ev) => `
Test ${ev.testId}:
Excerpt: "${ev.excerpt}"
${ev.context ? `Context: ${ev.context}` : ""}
`
  )
  .join("\n")}

## Failed Test Details:
\`\`\`json
${JSON.stringify(
  failedTests.map((t) => ({
    id: t.id,
    transcript: t.transcript.substring(0, 500),
    expectedBehavior: t.expectedBehavior,
    actualBehavior: t.actualBehavior,
  })),
  null,
  2
)}
\`\`\`

## Sample Passing Tests (for reference):
\`\`\`json
${JSON.stringify(
  passedTests.slice(0, 3).map((t) => ({
    id: t.id,
    transcript: t.transcript.substring(0, 300),
  })),
  null,
  2
)}
\`\`\`

## Task:
Generate MINIMAL, SURGICAL edits to fix this specific failure category.

Guidelines:
- Prefer small additions/modifications over rewrites
- Target specific sections of the prompt
- Each suggestion should be independently applicable
- Provide clear reasoning tied to evidence
- Only suggest changes that address THIS category

CRITICAL: Test-Grounded Suggestions
- Every suggestion MUST reference specific test IDs from the provided failed tests
- Do not generate suggestions that are not directly traceable to a test failure
- The linkedTestIds field must contain at least one test ID from the failed tests above

## Output Format (JSON):
\`\`\`json
{
  "suggestions": [
    {
      "type": "add" | "remove" | "replace",
      "targetSection": "Where in the prompt (e.g., 'tone guidelines', 'after first paragraph')",
      "originalText": "Text to replace (for 'replace' type)" or null,
      "proposedText": "New or replacement text",
      "reason": "Why this change addresses the failure category",
      "linkedTestIds": ["test-1", "test-2"]
    }
  ]
}
\`\`\`

Return 1-3 high-quality suggestions. Be specific and evidence-based.`;
  }

  private parseSuggestionResponse(text: string): SuggestionResponse {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    try {
      const parsed = JSON.parse(jsonText);
      return parsed as SuggestionResponse;
    } catch (error) {
      console.error("Failed to parse suggestion response:", text);
      throw new Error("Failed to parse suggestion response");
    }
  }
}

export const claudeClient = new ClaudeAPIClient();
