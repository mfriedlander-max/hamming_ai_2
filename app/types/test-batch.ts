export interface TestResult {
  id: string;
  status: "pass" | "fail";
  transcript: string;
  metadata?: Record<string, any>;
  expectedBehavior?: string;
  actualBehavior?: string;
}

export interface TestBatch {
  id: string;
  projectId: string;
  uploadedAt: number;
  fileName: string;
  fileType: "json" | "csv" | "excel";
  totalTests: number;
  passedTests: number;
  failedTests: number;
  tests: TestResult[];
}
