import { NextRequest, NextResponse } from "next/server";
import { claudeClient } from "@/lib/api/claude";
import type { TestResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { action, payload } = await request.json();

    switch (action) {
      case "analyze_failures":
        return await analyzeFailures(payload);
      case "generate_suggestions":
        return await generateSuggestions(payload);
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

async function analyzeFailures(payload: {
  systemPrompt: string;
  failedTests: TestResult[];
}) {
  const { systemPrompt, failedTests } = payload;

  if (!systemPrompt || !failedTests || failedTests.length === 0) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const categories = await claudeClient.analyzeFailures(
    systemPrompt,
    failedTests
  );

  return NextResponse.json({ categories });
}

async function generateSuggestions(payload: {
  systemPrompt: string;
  category: any;
  allTests: TestResult[];
}) {
  const { systemPrompt, category, allTests } = payload;

  if (!systemPrompt || !category || !allTests) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const response = await claudeClient.generateSuggestions(
    systemPrompt,
    category,
    allTests
  );

  return NextResponse.json(response);
}
