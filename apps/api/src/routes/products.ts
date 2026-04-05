import { FastifyInstance } from "fastify";
import { prisma } from "@mali-ai/db";
import { generateStoreConfig } from "@mali-ai/ai-engine";

export default async function productRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] };

  // Get all products for a store
  app.get("/store/:storeId", async (req) => {
    const { storeId } = req.params as any;
    return prisma.product.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });
  });

  // Get single product
  app.get("/:id", async (req, reply) => {
    const { id } = req.params as any;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return reply.code(404).send({ error: "Product not found" });
    return product;
  });

  // Create product (manual)
  app.post("/", auth, async (req, reply) => {
    const { id: userId } = req.user as any;
    const { storeId, title, description, price, comparePrice, images, stock, sku } = req.body as any;

    // Verify store ownership
    const store = await prisma.store.findFirst({ where: { id: storeId, userId } });
    if (!store) return reply.code(403).send({ error: "Unauthorized" });

    // Check product limits
    const productCount = await prisma.product.count({ where: { storeId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const limits = { FREE: 10, STARTER: 100, PRO: 999999 };
    if (productCount >= limits[user!.plan]) {
      return reply.code(403).send({ error: "Upgrade your plan to add more products" });
    }

    // AI-enhance description if not provided
    const finalDescription = description ||
      await generateProductDescription(title, store.name, (store.config as any).brandVoice || "professional");

    return prisma.product.create({
      data: { storeId, title, description: finalDescription, price, comparePrice, images: images || [], stock: stock || 0, sku, source: "MANUAL" },
    });
  });

  // Update product
  app.put("/:id", auth, async (req, reply) => {
    const { id: userId } = req.user as any;
    const { id } = req.params as any;
    const body = req.body as any;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });
    if (!product || product.store.userId !== userId)
      return reply.code(403).send({ error: "Unauthorized" });

    return prisma.product.update({ where: { id }, data: body });
  });

  // Delete product
  app.delete("/:id", auth, async (req, reply) => {
    const { id: userId } = req.user as any;
    const { id } = req.params as any;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });
    if (!product || product.store.userId !== userId)
      return reply.code(403).send({ error: "Unauthorized" });

    await prisma.product.delete({ where: { id } });
    return { success: true };
  });

  // Toggle active
  app.patch("/:id/toggle", auth, async (req, reply) => {
    const { id: userId } = req.user as any;
    const { id } = req.params as any;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });
    if (!product || product.store.userId !== userId)
      return reply.code(403).send({ error: "Unauthorized" });

    return prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });
  });

  // Import from AliExpress
  app.post("/aliexpress", auth, async (req, reply) => {
    const { id: userId } = req.user as any;
    const { storeId, aliexpressUrl } = req.body as any;

    const store = await prisma.store.findFirst({ where: { id: storeId, userId } });
    if (!store) return reply.code(403).send({ error: "Unauthorized" });

    // Extract product ID from URL
    const match = aliexpressUrl.match(/item\/(\d+)/);
    if (!match) return reply.code(400).send({ error: "Invalid AliExpress URL" });
    const aliexpressId = match[1];

    // Fetch from AliExpress API
    const res = await fetch(
      `https://api.aliexpress.com/v2/product?appKey=${process.env.ALIEXPRESS_APP_KEY}&productId=${aliexpressId}`
    );
    const data = await res.json() as any;
    const item = data?.result;
    if (!item) return reply.code(404).send({ error: "Product not found on AliExpress" });

    const description = await generateProductDescription(
      item.title,
      store.name,
      (store.config as any).brandVoice || "professional"
    );

    return prisma.product.create({
      data: {
        storeId,
        title: item.title,
        description,
        price: item.salePrice * 2.5, // 2.5x markup
        costEstimate: item.salePrice,
        images: item.imageUrls || [],
        source: "ALIEXPRESS",
        aliexpressId,
      } as any,
    });
  });
}