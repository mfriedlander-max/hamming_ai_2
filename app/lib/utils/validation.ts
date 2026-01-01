import { z } from "zod";

export const TestResultSchema = z.object({
  id: z.string(),
  status: z.enum(["pass", "fail"]),
  transcript: z.string(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const TestBatchSchema = z.object({
  tests: z.array(TestResultSchema),
});

export type ParsedTestBatch = z.infer<typeof TestBatchSchema>;
