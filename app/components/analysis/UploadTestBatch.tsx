"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Upload, CheckCircle, XCircle } from "lucide-react";
import { parseTestBatch } from "@/lib/parsers";
import type { TestResult } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface UploadTestBatchProps {
  onUpload: (
    tests: TestResult[],
    fileName: string,
    fileType: "json" | "csv" | "excel"
  ) => void;
  disabled?: boolean;
}

export function UploadTestBatch({ onUpload, disabled }: UploadTestBatchProps) {
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<{
    tests: TestResult[];
    fileName: string;
    fileType: "json" | "csv" | "excel";
  } | null>(null);
  const { toast } = useToast();

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setParsing(true);
    setError(null);

    try {
      const { tests, fileType } = await parseTestBatch(file);

      if (tests.length === 0) {
        throw new Error("No test results found in file");
      }

      const data = {
        tests,
        fileName: file.name,
        fileType,
      };

      setParsedData(data);
      onUpload(tests, file.name, fileType);
      toast({
        title: "File parsed",
        description: `${tests.length} tests ready for analysis.`,
      });
    } catch (err: any) {
      setError(err.message || "Failed to parse file");
      setParsedData(null);
      toast({
        title: "Upload failed",
        description: err.message || "Failed to parse file",
        variant: "destructive",
      });
    } finally {
      setParsing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
    disabled,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`rounded-xl border bg-card text-card-foreground shadow transition-smooth border-2 border-dashed p-6 text-center md:p-12 ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        } ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />

        <Upload className="mx-auto h-8 w-8 text-gray-400 md:h-12 md:w-12" />

        <p className="mt-4 text-sm font-medium text-gray-900">
          {isDragActive
            ? "Drop your test batch here"
            : "Drag & drop test batch, or click to browse"}
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Supports JSON, CSV, and Excel (.xlsx, .xls)
        </p>
      </div>

      {parsing && (
        <div className="text-center text-sm text-gray-600" role="status" aria-live="polite">
          Parsing file...
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50 p-4 transition-smooth">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Upload Failed</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {parsedData && (
        <Card className="border-green-200 bg-green-50 p-4 transition-smooth">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-900">File Parsed Successfully</p>
              <div className="mt-2 space-y-1 text-sm text-green-700">
                <p>File: {parsedData.fileName}</p>
                <p>Total tests: {parsedData.tests.length}</p>
                <p>
                  Passed: {parsedData.tests.filter((t) => t.status === "pass").length} |
                  Failed: {parsedData.tests.filter((t) => t.status === "fail").length}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
