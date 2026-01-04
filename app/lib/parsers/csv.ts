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
          // Validate results exist and are not empty
          if (!results.data || !Array.isArray(results.data) || results.data.length === 0) {
            reject(new Error("CSV file is empty or contains no valid data"));
            return;
          }

          const tests: TestResult[] = results.data.map((row: any) => {
            // Safely parse metadata JSON
            let metadata: Record<string, any> | undefined = undefined;
            if (row.metadata) {
              try {
                metadata = JSON.parse(row.metadata);
              } catch (e) {
                throw new Error(
                  `Invalid JSON in metadata field for test "${row.id || row.test_id || row.testId || 'unknown'}": ${e instanceof Error ? e.message : 'Unknown error'}`
                );
              }
            }

            const normalized = {
              id: row.id || row.test_id || row.testId || "",
              status: (row.status || "fail").toLowerCase(),
              transcript: row.transcript || row.output || "",
              expectedBehavior: row.expected_behavior || row.expectedBehavior,
              actualBehavior: row.actual_behavior || row.actualBehavior,
              metadata,
            };

            return TestResultSchema.parse(normalized);
          });

          resolve(tests);
        } catch (error) {
          reject(new Error(`CSV validation failed: ${error instanceof Error ? error.message : error}`));
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}
