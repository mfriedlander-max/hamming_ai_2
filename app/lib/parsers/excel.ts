import * as XLSX from "xlsx";
import type { TestResult } from "@/types";
import { TestResultSchema } from "@/lib/utils/validation";

export async function parseExcel(file: File): Promise<TestResult[]> {
  const buffer = await file.arrayBuffer();

  try {
    const workbook = XLSX.read(buffer, { type: "array" });

    // Validate workbook has sheets
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error("Excel file contains no sheets");
    }

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

    // Additional safety check for sheet data
    if (!firstSheet) {
      throw new Error("Excel file's first sheet is empty or corrupted");
    }

    const data = XLSX.utils.sheet_to_json(firstSheet);

    // Validate data exists and is not empty
    if (!data || data.length === 0) {
      throw new Error("Excel file is empty or contains no valid data");
    }

    const tests: TestResult[] = data.map((row: any) => {
      // Parse metadata as JSON to match CSV behavior
      let metadata: Record<string, any> | undefined = undefined;
      if (row.metadata) {
        // If metadata is already an object (rare in Excel), use it
        if (typeof row.metadata === 'object' && row.metadata !== null) {
          metadata = row.metadata;
        } else if (typeof row.metadata === 'string') {
          // If it's a string, try to parse it as JSON
          try {
            metadata = JSON.parse(row.metadata);
          } catch (e) {
            throw new Error(
              `Invalid JSON in metadata field for test "${row.id || row.test_id || row.testId || 'unknown'}": ${e instanceof Error ? e.message : 'Unknown error'}`
            );
          }
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

    return tests;
  } catch (error) {
    // Preserve specific metadata errors
    if (error instanceof Error && error.message.includes("metadata")) {
      throw error;
    }
    throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
