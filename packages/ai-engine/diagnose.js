const axios = require('axios');

const key = process.argv[2] || process.env.AI_API_KEY;

if (!key) {
  console.error("Please provide an API key: node diagnose.js YOUR_KEY");
  process.exit(1);
}

async function diagnose() {
  console.log("🔍 Querying Google AI Studio models...");
  try {
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    console.log("✅ Connection Successful!");
    console.log(`Found ${res.data.models.length} models.`);
    
    console.log("\n--- Available Model IDs ---");
    res.data.models.forEach(m => {
      const id = m.name.replace('models/', '');
      console.log(`- ${id} (${m.supportedGenerationMethods.join(', ')})`);
    });
    
  } catch (err) {
    console.error("❌ Diagnostic Failed!");
    if (err.response) {
      console.error(`Status: ${err.response.status}`);
      console.error(`Data: ${JSON.stringify(err.response.data)}`);
    } else {
      console.error(err.message);
    }
  }
}

diagnose();
