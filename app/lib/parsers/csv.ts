import Papa from "papaparse";
import type { TestResult } from "@/types";
import { TestResultSchema } from "@/lib/utils/validation";

export async function parseCSV(file: File): Promise<TestResult[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const tests: TestResult[] = results.data.map((row: any) => {
            const normalized = {
              id: row.id || row.test_id || row.testId || "",
              status: (row.status || "fail").toLowerCase(),
              transcript: row.transcript || row.output || "",
              expectedBehavior: row.expected_behavior || row.expectedBehavior,
              actualBehavior: row.actual_behavior || row.actualBehavior,
              metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
            };

            return TestResultSchema.parse(normalized);
          });

          resolve(tests);
        } catch (error) {
          reject(new Error(`CSV validation failed: ${error}`));
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}
