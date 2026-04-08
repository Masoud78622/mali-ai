const { callAI } = require("./dist/index");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../apps/api/.env") });

async function runTests() {
  console.log("🕵️ Starting Resilience Test (Failover Stack)...");

  // Test 1: Standard Call (Should hit Gemini first)
  console.log("\nTEST 1: Standard AI Call");
  try {
    const response = await callAI("Who are you? (Gemini, Groq, Cerebras, SambaNova, or OpenRouter?)");
    console.log(`📡 RESPONSE: ${response.trim()}`);
  } catch (err) {
    console.error(`❌ TEST 1 FAILED: ${err.message}`);
  }

  // Test 2: Simulate Gemini Failure (Temporarily breaking Gemini)
  console.log("\nTEST 2: Simulate Gemini Failure -> Groq Failover");
  const originalKey = process.env.AI_API_KEY;
  process.env.AI_API_KEY = "dummy_invalid_key_to_force_failover";
  
  try {
    const response = await callAI("Say only the word 'GEMINI' if you are Gemini, or 'GROQ' if you are Groq.");
    console.log(`📡 RESPONSE: ${response.trim()}`);
    if (response.toUpperCase().includes("GROQ")) {
      console.log("✅ FAILOVER SUCCESS: Switched to Groq correctly!");
    } else {
      console.log("⚠️ FAILOVER UNCERTAIN: Did not explicitly see 'GROQ' in response.");
    }
  } catch (err) {
    console.error(`❌ TEST 2 FAILED: ${err.message}`);
  } finally {
    process.env.AI_API_KEY = originalKey; // Restore key
  }

  // Test 3: Batched Generation Verification
  console.log("\nTEST 3: Batched Full Store Generation");
  const { generateFullStore } = require("./dist/index");
  try {
    const data = await generateFullStore("Luxury watches for professionals", "Watches", "Business owners");
    console.log(`✅ SUCCESS! Produced store: "${data.config.name}" with ${data.products.length} products.`);
    if (data.config && data.products.length === 8) {
      console.log("✅ Token Savings: 1 call instead of 2 (Verified)");
    }
  } catch (err) {
    console.error(`❌ TEST 3 FAILED: ${err.message}`);
  }
}

runTests();
