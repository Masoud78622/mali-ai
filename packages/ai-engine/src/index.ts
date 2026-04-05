const PROVIDERS = [
  { name: "custom",     envKey: "AI_API_KEY",        baseURLEnv: "AI_BASE_URL",                defaultModel: () => process.env.AI_MODEL || "gpt-3.5-turbo" },
  { name: "openrouter", envKey: "OPENROUTER_API_KEY", baseURL: "https://openrouter.ai/api/v1",  defaultModel: () => process.env.OPENROUTER_MODEL || "qwen/qwen-2.5-72b-instruct" },
  { name: "openai",     envKey: "OPENAI_API_KEY",     baseURL: "https://api.openai.com/v1",     defaultModel: () => "gpt-4o-mini" },
  { name: "groq",       envKey: "GROQ_API_KEY",       baseURL: "https://api.groq.com/openai/v1",defaultModel: () => "llama-3.3-70b-versatile" },
  { name: "together",   envKey: "TOGETHER_API_KEY",   baseURL: "https://api.together.xyz/v1",   defaultModel: () => "meta-llama/Llama-3-70b-chat-hf" },
  { name: "mistral",    envKey: "MISTRAL_API_KEY",    baseURL: "https://api.mistral.ai/v1",     defaultModel: () => "mistral-small-latest" },
  { name: "gemini",     envKey: "AI_API_KEY",         baseURL: "https://generativelanguage.googleapis.com/v1beta/openai", defaultModel: () => "gemini-2.0-flash" },
];

function isValid(key?: string) {
  return !!key && key.length > 10 && !key.includes("dummy");
}

function getProvider() {
  for (const p of PROVIDERS) {
    const apiKey = process.env[p.envKey]?.trim();
    if (!isValid(apiKey)) continue;
    const baseURL = (p as any).baseURLEnv
      ? process.env[(p as any).baseURLEnv] || ""
      : (p as any).baseURL;
    if (p.name === "custom" && !baseURL) continue;
    return { name: p.name, apiKey: apiKey!, baseURL, model: p.defaultModel() };
  }
  throw new Error(
    "No valid AI API key found. Set one of: AI_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY, GROQ_API_KEY, ANTHROPIC_API_KEY"
  );
}

export async function callAI(prompt: string, maxTokens = 1000): Promise<string> {
  const p = getProvider();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${p.apiKey}`,
  };
  if (p.name === "openrouter") {
    headers["HTTP-Referer"] = "https://mali-ai.com";
    headers["X-Title"] = "Mali AI";
  }
  const res = await fetch(`${p.baseURL}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: p.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });
  const data = await res.json() as any;
  if (!res.ok) throw new Error(`${p.name} error: ${data.error?.message || JSON.stringify(data)}`);
  return data.choices?.[0]?.message?.content || "";
}

export async function generateStoreConfig(description: string, niche?: string, audience?: string) {
  const prompt = `Expert e-commerce strategist. Generate a dropshipping store config.
INPUT:"${description}"${niche ? `\nNiche:${niche}` : ""}${audience ? `\nAudience:${audience}` : ""}
Reply ONLY valid JSON:
{"name":"store name","tagline":"tagline","niche":"niche","targetAudience":"audience","brandVoice":"casual|professional|luxury","theme":{"primaryColor":"#hex","secondaryColor":"#hex","accentColor":"#hex","backgroundColor":"#hex","textColor":"#hex","fontHeading":"Google Font","fontBody":"Google Font","style":"minimal|bold|elegant|playful|tech","borderRadius":"8px"},"seo":{"metaTitle":"<60 chars","metaDescription":"<160 chars","keywords":["k1","k2","k3"]},"pages":{"hero":{"headline":"headline","subheadline":"subheadline","ctaText":"Shop Now","features":[{"icon":"🚚","title":"Free Shipping","description":"On orders over ₹500"},{"icon":"🔒","title":"Secure Payment","description":"100% secure checkout"},{"icon":"↩️","title":"Easy Returns","description":"30-day returns"}]},"about":"about page text","shipping":"shipping policy","returns":"returns policy"},"productCategories":["cat1","cat2"],"pricingStrategy":"budget|mid|premium","estimatedMargin":35}`;
  const text = await callAI(prompt, 1500);
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

export async function generateProductDescription(title: string, niche: string, voice: string) {
  const prompt = `Write SEO product description for ${niche} store.
Product: ${title} | Voice: ${voice}
2 paragraphs: emotional hook + benefits. Text only, no markdown.`;
  return await callAI(prompt, 500);
}

export async function suggestProducts(niche: string, audience: string, pricing: string, count = 8) {
  const prompt = `Suggest ${count} winning dropshipping products.
Niche:${niche}|Audience:${audience}|Pricing:${pricing}
Reply ONLY JSON array:[{"title":"","description":"","price":29.99,"costEstimate":8.00,"margin":72,"category":"","tags":["t1"],"searchKeywords":["k1"]}]`;
  const text = await callAI(prompt, 1800);
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return []; }
}

export default { callAI, generateStoreConfig, generateProductDescription, suggestProducts };