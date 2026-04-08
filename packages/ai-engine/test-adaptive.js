const { generateFullStore } = require("./dist/index");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../apps/api/.env") });

async function verifyAdaptiveLogic() {
  console.log("🕵️ Verifying Universal Adaptive Logic...");

  const testNiches = [
    { 
      niche: "Industrial Tools", 
      desc: "High-power tactical flashlights for search and rescue",
      expectedTone: "authoritative" 
    },
    { 
      niche: "Parenting", 
      desc: "Organic cotton weighted blankets for infants",
      expectedTone: "caring/emotional" 
    },
    { 
      niche: "Auto Performance", 
      desc: "Turbocharged engine components for drag racing",
      expectedTone: "technical" 
    }
  ];

  for (const t of testNiches) {
    console.log(`\nTesting Niche: [${t.niche}]...`);
    try {
      const data = await generateFullStore(t.desc, t.niche);
      console.log(`✅ Name: ${data.config.name}`);
      console.log(`✅ Voice: ${data.config.brandVoice}`);
      console.log(`✅ Theme Style: ${data.config.theme.style}`);
      console.log(`✅ First Product: ${data.products[0].title}`);
      
      // Basic validation
      if (data.config.brandVoice && data.config.theme.primaryColor) {
        console.log("✨ Data structure is healthy.");
      }
    } catch (err) {
      console.error(`❌ FAILED [${t.niche}]: ${err.message}`);
    }
  }
}

verifyAdaptiveLogic();
