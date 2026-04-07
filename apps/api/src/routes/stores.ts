import { FastifyInstance } from "fastify";
import { prisma } from "@mali-ai/db";
import { generateStoreConfig, suggestProducts } from "@mali-ai/ai-engine";
import { nanoid } from "nanoid";

export default async function storeRoutes(app: FastifyInstance) {
  // Auth middleware
  const auth = { preHandler: [app.authenticate] };

  // Get all stores for user
  app.get("/", auth, async (req) => {
    const { id } = req.user as any;
    return prisma.store.findMany({
      where: { userId: id },
      include: { _count: { select: { products: true, orders: true } } },
    });
  });

  // Get single store
  app.get("/:id", auth, async (req, reply) => {
    const { id: userId } = req.user as any;
    const { id } = req.params as any;
    const store = await prisma.store.findFirst({
      where: { id, userId },
      include: { products: true },
    });
    if (!store) return reply.code(404).send({ error: "Store not found" });
    return store;
  });

  // Get store by subdomain (public)
  app.get("/subdomain/:subdomain", async (req, reply) => {
    const { subdomain } = req.params as any;
    const store = await prisma.store.findUnique({
      where: { subdomain },
      include: {
        products: { where: { isActive: true } },
      },
    });
    if (!store) return reply.code(404).send({ error: "Store not found" });
    return store;
  });

  // Create store
  app.post("/", auth, async (req, reply) => {
    const { id: userId } = req.user as any;
    const { description, niche, targetAudience } = req.body as any;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const storeCount = await prisma.store.count({ where: { userId } });
    const limits = { FREE: 1, STARTER: 3, PRO: 999 };
    const isUnlimited = user!.email === "masudshaikh@gmail.com" || user!.plan === "PRO";
    if (!isUnlimited && storeCount >= limits[user!.plan]) {
      return reply.code(403).send({ error: `Upgrade your plan to create more stores` });
    }

    try {
      console.log(`🚀 AI Store Generation Started: "${description.slice(0, 40)}..."`);
      
      // PHASE 1: Generate Store Branding & Design
      console.log("🎨 Generating design & branding...");
      const config = await generateStoreConfig(description, niche, targetAudience);
      const subdomain = nanoid(10).toLowerCase();

      // PHASE 2: Create Store
      const store = await prisma.store.create({
        data: {
          userId,
          subdomain,
          name: config.name,
          tagline: config.tagline,
          config,
          isLive: true,
        },
      });

      // PHASE 3: Generate Products
      console.log(`📦 Generating products for niche: ${config.niche}...`);
      const suggestedProducts = await suggestProducts(
        config.niche,
        config.targetAudience,
        config.pricingStrategy || "mid"
      );

      if (suggestedProducts && suggestedProducts.length > 0) {
        console.log(`✨ Saving ${suggestedProducts.length} AI-generated products...`);
        await prisma.product.createMany({
          data: suggestedProducts.map((p: any) => ({
            storeId: store.id,
            title: p.title,
            description: p.description,
            price: p.price,
            cost: p.costEstimate || 0,
            category: p.category || "General",
            images: [], // Images would be added via Ali Sourcing later
            isActive: true,
            inventory: 100,
          })),
        });
      }

      console.log(`✅ Store "${store.name}" successfully created!`);
      return store;
    } catch (err: any) {
      console.error("❌ AI Generation Error:", err.message);
      return reply.code(422).send({ 
        error: "AI Generation Failed", 
        message: err.message || "Failed to generate your store. Please try again."
      });
    }
  });

  // Update store config
  app.put("/:id", auth, async (req, reply) => {
    const { id: userId } = req.user as any;
    const { id } = req.params as any;
    const body = req.body as any;
    const store = await prisma.store.findFirst({ where: { id, userId } });
    if (!store) return reply.code(404).send({ error: "Store not found" });
    return prisma.store.update({ where: { id }, data: body });
  });

  // Delete store
  app.delete("/:id", auth, async (req, reply) => {
    const { id: userId } = req.user as any;
    const { id } = req.params as any;
    const store = await prisma.store.findFirst({ where: { id, userId } });
    if (!store) return reply.code(404).send({ error: "Store not found" });
    await prisma.store.delete({ where: { id } });
    return { success: true };
  });
}