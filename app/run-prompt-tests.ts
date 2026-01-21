import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
const envPath = path.join(__dirname, ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const apiKey = envContent
  .split("\n")
  .find((line) => line.startsWith("ANTHROPIC_API_KEY="))
  ?.split("=")[1]
  ?.trim();

if (!apiKey) {
  console.error("ANTHROPIC_API_KEY not found in .env.local");
  process.exit(1);
}

const client = new Anthropic({ apiKey });

// The two prompts to compare
const ORIGINAL_PROMPT = `You are a customer support agent. Answer questions about orders.`;

const IMPROVED_PROMPT = `You are a compassionate customer support agent. Answer questions about orders while providing excellent emotional support to customers.

Always acknowledge customer emotions and show empathy before addressing their request. When customers express frustration, anger, or disappointment, validate their feelings and apologize for their negative experience.

For returns/exchanges: 1) Check item eligibility and policy timeframe, 2) Provide complete return instructions including prepaid shipping when company is at fault, 3) For damaged items, request photos if helpful and offer both replacement and refund options.`;

// Test cases - just the user inputs and expected behaviors
const TEST_CASES = [
  {
    id: "test-001",
    userInput: "What are your business hours?",
    expectedBehavior: "Provide accurate business hours information",
  },
  {
    id: "test-002",
    userInput: "Where is my order #12345?",
    expectedBehavior:
      "Acknowledge order number and provide tracking information",
  },
  {
    id: "test-003",
    userInput: "I want a refund NOW! This product is absolute garbage!",
    expectedBehavior:
      "De-escalate the situation first by acknowledging frustration, apologize for the experience, then explain refund policy and process",
  },
  {
    id: "test-004",
    userInput: "Your company is terrible! I've been waiting 3 weeks for my order!",
    expectedBehavior:
      "Express empathy, apologize for the delay, acknowledge the frustration before asking for order details",
  },
  {
    id: "test-005",
    userInput: "Can I return this item I bought 45 days ago?",
    expectedBehavior:
      "Check and explain the return policy timeframe (typically 30 days), clarify if the item is eligible, provide specific return instructions",
  },
  {
    id: "test-006",
    userInput: "Do you ship to Canada?",
    expectedBehavior:
      "Confirm international shipping availability and provide relevant details",
  },
  {
    id: "test-007",
    userInput: "I received the wrong item in my order.",
    expectedBehavior:
      "Apologize sincerely, take responsibility, offer to send correct item immediately, provide prepaid return label, consider offering compensation for inconvenience",
  },
  {
    id: "test-008",
    userInput: "I want to speak to a manager right now!",
    expectedBehavior:
      "First try to understand and resolve the issue, ask what specific concern they have, attempt to help before escalating, only escalate if customer insists after attempted resolution",
  },
  {
    id: "test-009",
    userInput: "What payment methods do you accept?",
    expectedBehavior: "List all accepted payment methods clearly",
  },
  {
    id: "test-010",
    userInput: "The product I received is damaged. What do I do?",
    expectedBehavior:
      "Express genuine concern, apologize for the damaged item, ask for photos if helpful, offer replacement AND refund options, provide prepaid return shipping",
  },
];

async function runTest(
  systemPrompt: string,
  userInput: string
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: systemPrompt,
    messages: [{ role: "user", content: userInput }],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

async function evaluateResponse(
  userInput: string,
  expectedBehavior: string,
  actualResponse: string
): Promise<{ pass: boolean; reasoning: string }> {
  const evaluationPrompt = `You are evaluating a customer support response. Determine if it meets the expected behavior.

User Input: "${userInput}"

Expected Behavior: "${expectedBehavior}"

Actual Response: "${actualResponse}"

Does the actual response meet the expected behavior? Consider:
- Does it address the key requirements in the expected behavior?
- Is the tone appropriate?
- Are important details included?

Respond with JSON only: {"pass": true/false, "reasoning": "brief explanation"}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 200,
    messages: [{ role: "user", content: evaluationPrompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "{}";
  try {
    return JSON.parse(text);
  } catch {
    return { pass: false, reasoning: "Failed to parse evaluation" };
  }
}

async function runAllTests(promptName: string, systemPrompt: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Running tests with: ${promptName}`);
  console.log(`${"=".repeat(60)}\n`);

  let passed = 0;
  let failed = 0;

  for (const test of TEST_CASES) {
    console.log(`\n--- ${test.id} ---`);
    console.log(`User: ${test.userInput.substring(0, 50)}...`);

    // Run the prompt
    const response = await runTest(systemPrompt, test.userInput);
    console.log(`Response: ${response.substring(0, 100)}...`);

    // Evaluate
    const evaluation = await evaluateResponse(
      test.userInput,
      test.expectedBehavior,
      response
    );

    if (evaluation.pass) {
      console.log(`✅ PASS: ${evaluation.reasoning}`);
      passed++;
    } else {
      console.log(`❌ FAIL: ${evaluation.reasoning}`);
      failed++;
    }
  }

  const passRate = ((passed / TEST_CASES.length) * 100).toFixed(1);
  console.log(`\n${"=".repeat(60)}`);
  console.log(`${promptName} Results:`);
  console.log(`  Passed: ${passed}/${TEST_CASES.length}`);
  console.log(`  Failed: ${failed}/${TEST_CASES.length}`);
  console.log(`  Pass Rate: ${passRate}%`);
  console.log(`${"=".repeat(60)}\n`);

  return { passed, failed, passRate: parseFloat(passRate) };
}

async function main() {
  console.log("Starting prompt comparison test...\n");

  // Run with original prompt
  const originalResults = await runAllTests("ORIGINAL PROMPT", ORIGINAL_PROMPT);

  // Run with improved prompt
  const improvedResults = await runAllTests("IMPROVED PROMPT", IMPROVED_PROMPT);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("COMPARISON SUMMARY");
  console.log("=".repeat(60));
  console.log(`Original Prompt Pass Rate: ${originalResults.passRate}%`);
  console.log(`Improved Prompt Pass Rate: ${improvedResults.passRate}%`);
  const improvement = improvedResults.passRate - originalResults.passRate;
  if (improvement > 0) {
    console.log(`\n🎉 IMPROVEMENT: +${improvement.toFixed(1)}% pass rate increase!`);
  } else if (improvement < 0) {
    console.log(`\n⚠️ REGRESSION: ${improvement.toFixed(1)}% pass rate decrease`);
  } else {
    console.log(`\n➡️ NO CHANGE in pass rate`);
  }
  console.log("=".repeat(60));
}

main().catch(console.error);
