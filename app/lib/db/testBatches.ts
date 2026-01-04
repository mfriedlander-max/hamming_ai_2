import { nanoid } from "nanoid";
import { db } from "./client";
import type { TestBatch, TestResult } from "@/types";

export async function createTestBatch(data: {
  projectId: string;
  fileName: string;
  fileType: "json" | "csv" | "excel";
  tests: TestResult[];
}): Promise<TestBatch> {
  const passedTests = data.tests.filter((t) => t.status === "pass").length;
  const failedTests = data.tests.filter((t) => t.status === "fail").length;

  const testBatch: TestBatch = {
    id: nanoid(),
    projectId: data.projectId,
    uploadedAt: Date.now(),
    fileName: data.fileName,
    fileType: data.fileType,
    totalTests: data.tests.length,
    passedTests,
    failedTests,
    tests: data.tests,
  };

  await db.testBatches.add(testBatch);
  return testBatch;
}

export async function getTestBatch(id: string): Promise<TestBatch | undefined> {
  return await db.testBatches.get(id);
}

export async function getTestBatchesByProject(
  projectId: string
): Promise<TestBatch[]> {
  // Use explicit sorting instead of reverse for proper ordering
  // .reverse() doesn't guarantee order without sortBy when using where()
  const batches = await db.testBatches
    .where("projectId")
    .equals(projectId)
    .toArray();

  // Sort by uploadedAt in descending order (newest first)
  return batches.sort((a, b) => b.uploadedAt - a.uploadedAt);
}
