import * as XLSX from "xlsx";
import type { TestResult } from "@/types";
import { TestResultSchema } from "@/lib/utils/validation";

export async function parseExcel(file: File): Promise<TestResult[]> {
  const buffer = await file.arrayBuffer();

  try {
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet);

    const tests: TestResult[] = data.map((row: any) => {
      const normalized = {
        id: row.id || row.test_id || row.testId || "",
        status: (row.status || "fail").toLowerCase(),
        transcript: row.transcript || row.output || "",
        expectedBehavior: row.expected_behavior || row.expectedBehavior,
        actualBehavior: row.actual_behavior || row.actualBehavior,
        metadata: row.metadata,
      };

      return TestResultSchema.parse(normalized);
    });

    return tests;
  } catch (error) {
    throw new Error(`Excel parsing failed: ${error}`);
  }
}
