require("dotenv").config({ path: "../../apps/api/.env" });
console.log("AI_API_KEY:", process.env.AI_API_KEY ? "EXISTS" : "MISSING");
console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY ? "EXISTS" : "MISSING");
