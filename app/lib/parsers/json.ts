import { TestBatchSchema } from "@/lib/utils/validation";
import type { TestResult } from "@/types";

export async function parseJSON(file: File): Promise<TestResult[]> {
  const text = await file.text();

  // Validate file is not empty
  if (!text || text.trim().length === 0) {
    throw new Error("JSON file is empty");
  }

  try {
    const data = JSON.parse(text);

    // Better error messages - validate structure before schema validation
    if (!data || typeof data !== 'object') {
      throw new Error("JSON file must contain an object or array");
    }

    // Check for empty data
    if (Array.isArray(data) && data.length === 0) {
      throw new Error("JSON file contains an empty array");
    }
    if (!Array.isArray(data) && !data.tests) {
      throw new Error("JSON file must have a 'tests' array property");
    }
    if (!Array.isArray(data) && Array.isArray(data.tests) && data.tests.length === 0) {
      throw new Error("JSON file 'tests' array is empty");
    }

    const validated = TestBatchSchema.parse(data);
    return validated.tests;
  } catch (error) {
    // Distinguish between JSON syntax and validation errors
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON syntax: ${error.message}`);
    }
    // If it's a Zod validation error, provide more context
    if (error instanceof Error && error.name === 'ZodError') {
      throw new Error(`JSON validation failed: File structure doesn't match expected test batch format. ${error.message}`);
    }
    // Re-throw our custom error messages
    if (error instanceof Error && error.message.includes("JSON file")) {
      throw error;
    }
    throw new Error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
