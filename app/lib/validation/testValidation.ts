import type { TestResult } from "@/types";

/**
 * Validates that a test has all required fields for processing.
 * A valid test must have: id, status, and transcript.
 */
export function isValidTest(test: TestResult): boolean {
  return !!(
    test.id &&
    test.status &&
    test.transcript !== undefined &&
    test.transcript !== null
  );
}

/**
 * Returns a human-readable validation error for an invalid test,
 * or null if the test is valid.
 */
export function getTestValidationError(test: TestResult): string | null {
  if (!test.id) return "Missing test ID";
  if (!test.status) return "Missing test status";
  if (test.transcript === undefined || test.transcript === null) {
    return "Missing transcript";
  }
  return null;
}

export interface TestValidationResult {
  valid: TestResult[];
  invalid: TestResult[];
  summary: string | null;
}

/**
 * Filters tests into valid and invalid groups, returning a summary message
 * if any invalid tests were found.
 */
export function filterValidTests(tests: TestResult[]): TestValidationResult {
  const valid = tests.filter(isValidTest);
  const invalid = tests.filter((t) => !isValidTest(t));
  const summary =
    invalid.length > 0
      ? `${invalid.length} test(s) are invalid and were skipped.`
      : null;
  return { valid, invalid, summary };
}
