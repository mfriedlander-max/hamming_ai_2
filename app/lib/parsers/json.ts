import { TestBatchSchema } from "@/lib/utils/validation";
import type { TestResult } from "@/types";

export async function parseJSON(file: File): Promise<TestResult[]> {
  const text = await file.text();

  try {
    const data = JSON.parse(text);
    const validated = TestBatchSchema.parse(data);
    return validated.tests;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON format");
    }
    throw new Error(`Validation failed: ${error}`);
  }
}
