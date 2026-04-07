const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyCzsBnbwEb1BYJjZP3TNwbNXT75C5va-9U"; // Real key from apps/api/.env
const genAI = new GoogleGenerativeAI(API_KEY);

const candidates = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite-preview-02-05",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-pro"
];

async function test() {
  console.log("🕵️ Starting Deep Model Test...");
  for (const modelName of candidates) {
    try {
      console.log(`Testing [${modelName}]...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello");
      const response = await result.response;
      console.log(`✅ SUCCESS: [${modelName}] is working! Response: ${response.text().trim()}`);
    } catch (err) {
      console.log(`❌ FAILED: [${modelName}] - ${err.message}`);
    }
  }
}

test();
