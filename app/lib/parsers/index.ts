import { parseJSON } from "./json";
import { parseCSV } from "./csv";
import { parseExcel } from "./excel";
import type { TestResult } from "@/types";

export async function parseTestBatch(
  file: File
): Promise<{ tests: TestResult[]; fileType: "json" | "csv" | "excel" }> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  let tests: TestResult[];
  let fileType: "json" | "csv" | "excel";

  switch (extension) {
    case "json":
      tests = await parseJSON(file);
      fileType = "json";
      break;
    case "csv":
      tests = await parseCSV(file);
      fileType = "csv";
      break;
    case "xlsx":
    case "xls":
      tests = await parseExcel(file);
      fileType = "excel";
      break;
    default:
      throw new Error(
        `Unsupported file type: ${extension}. Please upload JSON, CSV, or Excel files.`
      );
  }

  return { tests, fileType };
}
