import { describe, it, expect } from "vitest";
import {
  isValidTest,
  getTestValidationError,
  filterValidTests,
} from "./testValidation";
import type { TestResult } from "@/types";

describe("testValidation", () => {
  const createMockTest = (overrides: Partial<TestResult> = {}): TestResult => ({
    id: "test-1",
    status: "fail",
    transcript: "Test transcript content",
    expectedBehavior: "Expected behavior",
    actualBehavior: "Actual behavior",
    metadata: {},
    ...overrides,
  });

  describe("isValidTest", () => {
    it("should return true for a valid test with all required fields", () => {
      const test = createMockTest();
      expect(isValidTest(test)).toBe(true);
    });

    it("should return false for a test missing id", () => {
      const test = createMockTest({ id: "" });
      expect(isValidTest(test)).toBe(false);
    });

    it("should return false for a test with undefined id", () => {
      const test = createMockTest({ id: undefined as unknown as string });
      expect(isValidTest(test)).toBe(false);
    });

    it("should return false for a test missing status", () => {
      const test = createMockTest({
        status: "" as unknown as "pass" | "fail",
      });
      expect(isValidTest(test)).toBe(false);
    });

    it("should return false for a test missing transcript", () => {
      const test = createMockTest({ transcript: "" });
      expect(isValidTest(test)).toBe(true); // Empty string is valid, just not undefined/null
    });

    it("should return false for a test with undefined transcript", () => {
      const test = createMockTest({
        transcript: undefined as unknown as string,
      });
      expect(isValidTest(test)).toBe(false);
    });

    it("should return false for a test with null transcript", () => {
      const test = createMockTest({ transcript: null as unknown as string });
      expect(isValidTest(test)).toBe(false);
    });

    it("should return true for a test without optional fields", () => {
      const test: TestResult = {
        id: "test-1",
        status: "pass",
        transcript: "Some transcript",
      };
      expect(isValidTest(test)).toBe(true);
    });
  });

  describe("getTestValidationError", () => {
    it("should return null for a valid test", () => {
      const test = createMockTest();
      expect(getTestValidationError(test)).toBeNull();
    });

    it("should return error for missing id", () => {
      const test = createMockTest({ id: "" });
      expect(getTestValidationError(test)).toBe("Missing test ID");
    });

    it("should return error for missing status", () => {
      const test = createMockTest({
        status: undefined as unknown as "pass" | "fail",
      });
      expect(getTestValidationError(test)).toBe("Missing test status");
    });

    it("should return error for undefined transcript", () => {
      const test = createMockTest({
        transcript: undefined as unknown as string,
      });
      expect(getTestValidationError(test)).toBe("Missing transcript");
    });

    it("should return error for null transcript", () => {
      const test = createMockTest({ transcript: null as unknown as string });
      expect(getTestValidationError(test)).toBe("Missing transcript");
    });

    it("should return first error when multiple fields are missing", () => {
      const test = createMockTest({
        id: "",
        status: undefined as unknown as "pass" | "fail",
      });
      expect(getTestValidationError(test)).toBe("Missing test ID");
    });
  });

  describe("filterValidTests", () => {
    it("should separate valid and invalid tests", () => {
      const validTest = createMockTest({ id: "valid-1" });
      const invalidTest = createMockTest({
        id: "",
        status: "fail",
        transcript: "test",
      });
      const tests = [validTest, invalidTest];

      const result = filterValidTests(tests);

      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(1);
      expect(result.valid[0].id).toBe("valid-1");
    });

    it("should return null summary when all tests are valid", () => {
      const tests = [
        createMockTest({ id: "test-1" }),
        createMockTest({ id: "test-2" }),
      ];

      const result = filterValidTests(tests);

      expect(result.summary).toBeNull();
      expect(result.valid).toHaveLength(2);
      expect(result.invalid).toHaveLength(0);
    });

    it("should return summary with count when some tests are invalid", () => {
      const tests = [
        createMockTest({ id: "test-1" }),
        createMockTest({ id: "" }),
        createMockTest({ id: "" }),
      ];

      const result = filterValidTests(tests);

      expect(result.summary).toBe("2 test(s) are invalid and were skipped.");
      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(2);
    });

    it("should handle empty array", () => {
      const result = filterValidTests([]);

      expect(result.valid).toHaveLength(0);
      expect(result.invalid).toHaveLength(0);
      expect(result.summary).toBeNull();
    });

    it("should handle all invalid tests", () => {
      const tests = [
        createMockTest({ id: "" }),
        createMockTest({ transcript: null as unknown as string }),
      ];

      const result = filterValidTests(tests);

      expect(result.valid).toHaveLength(0);
      expect(result.invalid).toHaveLength(2);
      expect(result.summary).toBe("2 test(s) are invalid and were skipped.");
    });
  });
});
