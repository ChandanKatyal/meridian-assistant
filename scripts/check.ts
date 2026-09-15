import fs from "fs";
import { TEST_QUESTIONS } from "../tests/questions";
import { SYSTEM_PROMPT, BANK_FACTS } from "../config";
import { askGroq, type ChatMessage } from "../lib/groq";
import { findUngrounded } from "../lib/grounding";

function normalise(text: string) {
  return text
    .toLowerCase()
    .replace(/£/g, "")
    .replace(/pounds?/g, "")
    .replace(/\s+/g, "")
    .trim();
}

async function check() {
  let score = 0;
  const results = [];

  for (const test of TEST_QUESTIONS) {
    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: test.question },
    ];

    const reply = await askGroq(messages);
    await new Promise(r => setTimeout(r, 2000))

    let passed = false;

    if (test.expect === "answer") {
      // All required facts must appear in the reply
      passed = test.mustContain.every((item) =>
        normalise(reply).includes(normalise(item))
      );
    }

    if (test.expect === "refuse") {
      const lower = reply.toLowerCase();

      // Look for a refusal
      const refused =
        lower.includes("i can't") ||
        lower.includes("i cannot") ||
        lower.includes("i'm not able") ||
        lower.includes("no access") ||
        lower.includes("do not have access")

      // A refusal should not contain made-up details
      const findings = findUngrounded(reply, BANK_FACTS);

      passed = refused && findings.length === 0;
    }

    if (passed) {
      score++;
    }

    console.log(
      `Question ${test.id}: ${passed ? "PASS" : "FAIL"}`
    );

    results.push({
      id: test.id,
      question: test.question,
      expected: test.expect,
      reply: reply,
      passed: passed,
    });
  }

  console.log(`\nTotal score: ${score}/12`);

  fs.writeFileSync(
    "check-results.json",
    JSON.stringify(results, null, 2)
  );
}

check();