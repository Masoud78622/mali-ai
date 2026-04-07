import { FastifyInstance } from "fastify";
import { prisma } from "@mali-ai/db";
import { generateStoreConfig } from "@mali-ai/ai-engine";
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

    // Check plan limits
    const storeCount = await prisma.store.count({ where: { userId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const limits = { FREE: 1, STARTER: 3, PRO: 999 };
    if (storeCount >= limits[user!.plan]) {
      return reply.code(403).send({ error: `Upgrade your plan to create more stores` });
    }

    // Generate AI config
    try {
      console.log(`🚀 Starting AI generation for store: ${description.slice(0, 50)}...`);
      const config = await generateStoreConfig(description, niche, targetAudience);
      const subdomain = `${nanoid(10).toLowerCase()}`;

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
      return store;
    } catch (err: any) {
      console.error("❌ Store creation failed:", err.message);
      return reply.code(422).send({ 
        error: "AI Generation Failed", 
        message: err.message || "The AI was unable to generate your store configuration. Please try describing your business differently."
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