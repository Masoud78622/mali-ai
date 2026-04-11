import { GoogleGenerativeAI } from "@google/generative-ai";

const PROVIDERS = [
  { name: "gemini",     envKey: "AI_API_KEY",         baseURL: "", defaultModel: () => process.env.AI_MODEL || "gemini-1.5-flash" },
  { name: "groq",       envKey: "GROQ_API_KEY",       baseURL: "https://api.groq.com/openai/v1", defaultModel: () => "llama-3.3-70b-versatile" },
  { name: "openrouter", envKey: "OPENROUTER_API_KEY", baseURL: "https://openrouter.ai/api/v1",  defaultModel: () => process.env.OPENROUTER_MODEL || "qwen/qwen-2.5-72b-instruct" },
  { name: "cerebras",   envKey: "CEREBRAS_API_KEY",   baseURL: "https://api.cerebras.ai/v1",    defaultModel: () => "llama3.1-8b" },
  { name: "sambanova",  envKey: "SAMBANOVA_API_KEY",  baseURL: "https://api.sambanova.ai/v1",   defaultModel: () => "Meta-Llama-3.3-70B-Instruct" },
  { name: "openai",     envKey: "OPENAI_API_KEY",     baseURL: "https://api.openai.com/v1",     defaultModel: () => "gpt-4o-mini" },
  { name: "together",   envKey: "TOGETHER_API_KEY",   baseURL: "https://api.together.xyz/v1",   defaultModel: () => "meta-llama/Llama-3-70b-chat-hf" },
  { name: "mistral",    envKey: "MISTRAL_API_KEY",    baseURL: "https://api.mistral.ai/v1",     defaultModel: () => "mistral-small-latest" },
  { name: "custom",     envKey: "AI_API_KEY",        baseURLEnv: "AI_BASE_URL",                defaultModel: () => process.env.AI_MODEL || "gpt-3.5-turbo" },
];

function getStack() {
  const stack = ["gemini", "groq", "cerebras", "sambanova", "openrouter"];
  if (process.env.AI_BASE_URL && process.env.AI_BASE_URL.includes("generativelanguage")) {
    stack.unshift("custom");
  }
  return stack;
}

function isValid(key?: string) {
  return !!key && key.length > 10 && !key.includes("dummy");
}

function getProviderConfig(name: string) {
  const p = PROVIDERS.find(x => x.name === name);
  if (!p) return null;

  let apiKey = process.env[p.envKey]?.trim();
  
  // Broad environment variable support for Gemini
  if (name === "gemini" && !isValid(apiKey)) {
    apiKey = (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "").trim();
  }

  if (!isValid(apiKey)) return null;

  const baseURL = (p as any).baseURLEnv
    ? process.env[(p as any).baseURLEnv] || ""
    : (p as any).baseURL;
  
  if (p.name === "custom" && !baseURL) return null;

  return { 
    name: p.name, 
    apiKeys: apiKey!.split(",").map(k => k.trim()).filter(Boolean), 
    baseURL, 
    model: p.defaultModel() 
  };
}

function extractJSON(text: string) {
  let cleanText = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
  try {
    return JSON.parse(cleanText);
  } catch (err) {
    try {
      const match = cleanText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (match) return JSON.parse(match[0]);
    } catch {}
    console.error("❌ Failed to parse AI JSON:", text.slice(0, 500));
    throw new Error("AI response malformed. Please try again.");
  }
}

export async function callAI(prompt: string, maxTokens = 2000): Promise<string> {
  let lastError: any = null;
  const stack = getStack();

  console.log(`🚀 Starting AI Generation Stack: [${stack.join(" -> ")}]`);

  for (const providerName of stack) {
    const p = getProviderConfig(providerName);
    if (!p) continue;

    for (const currentKey of p.apiKeys) {
      console.log(`🤖 Testing Provider: ${p.name.toUpperCase()} (${currentKey.slice(0, 6)}...${currentKey.slice(-4)})`);
      
      let retryCount = 0;
      while (retryCount <= 1) {
        try {
          if (p.name === "gemini") {
            const genAI = new GoogleGenerativeAI(currentKey);
            
            // Inline Model Fallback Strategy for Gemini (Super-Resilient)
            const geminiModels = [
              p.model, 
              "gemini-2.0-flash-exp", 
              "gemini-2.0-flash", 
              "gemini-1.5-flash-latest", 
              "gemini-1.5-flash", 
              "gemini-pro"
            ].filter((v, i, a) => a.indexOf(v) === i);
            
            for (const mId of geminiModels) {
              try {
                console.log(`   └─ Attempting Model: ${mId}`);
                const model = genAI.getGenerativeModel({ model: mId });
                const result = await model.generateContent({
                  contents: [{ role: "user", parts: [{ text: prompt }] }],
                  generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 }
                });
                const responseText = (await result.response).text();
                if (responseText) {
                  console.log(`   ✅ Success via ${mId}`);
                  return responseText;
                }
              } catch (gemErr: any) {
                if (gemErr.message.includes("404") || gemErr.message.includes("not found")) {
                  console.warn(`   ⚠️ Model ${mId} not found, trying next...`);
                  continue;
                }
                throw gemErr;
              }
            }
            throw new Error("All Gemini models 404'd or failed.");
          } else {
            console.log(`   └─ Model: ${p.model}`);
            const res = await fetch(`${p.baseURL}${p.baseURL.endsWith('/') ? '' : '/'}chat/completions`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${currentKey}`,
              },
              body: JSON.stringify({
                model: p.model,
                messages: [{ role: "user", content: prompt }],
                max_tokens: maxTokens,
                temperature: 0.7,
              }),
            });
            
            if (!res.ok) {
              const body = await res.text();
              throw new Error(`HTTP ${res.status}: ${body.slice(0, 100)}`);
            }
            
            const data = await res.json();
            const content = data.choices?.[0]?.message?.content;
            if (content) {
              console.log(`   ✅ Success via ${p.name}`);
              return content;
            }
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`   ❌ Entry Failed: ${err.message}`);
          
          if (err.message.includes("429") || err.message.includes("limit") || err.message.includes("404")) {
            break; // Move to next key or next provider
          }
          retryCount++;
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
  }
  throw new Error(`AI Failover Failed: ${lastError?.message}`);
}

/**
 * generateFullStore: Batches store config and product generation into ONE call.
 * PRO UPGRADE: Adaptive Niche Authority Logic.
 */
export async function generateFullStore(description: string, niche?: string, audience?: string) {
  const prompt = `Adaptive Store Generation
TASK: Analyze the niche and generate a complete, high-converting "Boutique Brand" identity.
INPUT: "${description}" | Niche: ${niche} | Audience: ${audience}

STEP 1: Identify Persona (Industrial-Expert, Aesthetic-Stylist, Tech-Innovator, or Caring-Friend).
STEP 2: Generate config with niche-appropriate authority signals (Trust Badges, Professional Tone).
- Themes: Industrial (Rugged/High-Contrast), Baby/Pets (Warm/Soft), Beauty (Minimal/Elegant), Tech (Modern/Dark).

Output ONLY minified JSON:
{
  "config": {
    "name":"", "tagline":"", "niche":"", "targetAudience":"", "brandVoice":"authoritative|playful|minimalist|emotional",
    "brandStory": "1-sentence expertise/mission statement.",
    "theme": {"primaryColor":"#hex", "secondaryColor":"#hex", "accentColor":"#hex", "backgroundColor":"#hex", "textColor":"#hex", "fontHeading":"", "fontBody":"", "style":"minimal|bold|elegant|playful|tech", "borderRadius":"8px"},
    "seo": {"metaTitle":"", "metaDescription":"", "keywords":[]},
    "pages": {"hero":{"headline":"", "subheadline":"", "ctaText":"", "features":[{"icon":"🚚|🔒|⭐", "title":"", "description":""}]}, "about":"", "shipping":"", "returns":""},
    "productCategories":[], "pricingStrategy":"budget|mid|premium", "estimatedMargin":35
  },
  "products": [{"title":"","description":"Emotional hook + Benefit description", "price":29.99,"costEstimate":8.0,"margin":72,"soldCount":45,"viewCount":12,"category":"","tags":[],"searchKeywords":[]}]
}
Generate 8 products. Add 3 trust-building features in Hero (e.g., 'Eco-Frendly', 'Pro-Grade', 'Secure'). Add realistic small int stats for sales/viewers.`;

  const text = await callAI(prompt, 3500);
  return extractJSON(text);
}

// Legacy functions
export async function generateStoreConfig(description: string, niche?: string, audience?: string) {
  const prompt = `Adaptive Store Config for: ${description}. Output ONLY minified JSON.`;
  return extractJSON(await callAI(prompt, 1000));
}

export async function suggestProducts(niche: string, audience: string, pricing: string, count = 8) {
  const prompt = `Suggest ${count} winning products for niche "${niche}" (${audience}). Adaptive Tone. Output ONLY minified JSON array.`;
  return extractJSON(await callAI(prompt, 2000));
}

export async function generateProductDescription(title: string, niche: string, voice: string) {
  const prompt = `ADAPTIVE STORYTELLER: Write description for "${title}" (${niche}). Voice: ${voice}. Focus on EMOTIONAL BENEFITS or TECHNICAL AUTHORITY. Text only.`;
  return await callAI(prompt, 400);
}

export default { callAI, generateFullStore, generateStoreConfig, generateProductDescription, suggestProducts };