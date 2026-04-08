import { FastifyInstance } from "fastify";
import { prisma } from "@mali-ai/db";
import Razorpay from "razorpay";
import crypto from "crypto";

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export default async function orderRoutes(app: FastifyInstance) {
  // Create Razorpay order (called before checkout)
  app.post("/create", async (req, reply) => {
    const { storeId, customerName, customerEmail, customerPhone, customerAddress, items } = req.body as any;

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return reply.code(404).send({ error: "Store not found" });

    // Calculate total
    let total = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return reply.code(404).send({ error: `Product ${item.productId} not found` });
      total += Number(product.price) * item.quantity;
    }

    // Create Razorpay order
    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(total * 100), // paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
    });

    // Create pending order in DB
    const order = await prisma.order.create({
      data: {
        storeId,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
        },
        total,
        razorpayOrderId: razorpayOrder.id,
      },
    });

    return {
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    };
  });

  // Create Manual UPI Order
  app.post("/manual-create", async (req, reply) => {
    const { storeId, customerName, customerEmail, customerPhone, customerAddress, items } = req.body as any;

    const store = await prisma.store.findUnique({ 
      where: { id: storeId },
      include: { user: true }
    });
    if (!store) return reply.code(404).send({ error: "Store not found" });

    // Calculate total
    let total = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      total += Number(product.price) * item.quantity;
    }

    // Create pending order in DB
    const order = await prisma.order.create({
      data: {
        storeId,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
        },
        total,
        status: "PENDING",
      },
    });

    // Send WhatsApp notification to owner
    const ownerPhone = store.user.whatsappNumber || store.user.phone;
    if (ownerPhone) {
      try {
        const { sendOrderNotification } = await import("../utils/whatsapp.js");
        sendOrderNotification(ownerPhone, {
          customerName,
          amount: total,
          orderId: order.id,
          upiId: customerAddress?.upiId,
        }).catch((err: any) => console.error("❌ WhatsApp Notification Error:", err));
      } catch (err) {
        console.error("❌ Failed to load WhatsApp utility:", err);
      }
    }

    return { success: true, orderId: order.id };
  });

  // Get orders for store owner
  app.get("/store/:storeId", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id: userId } = req.user as any;
    const { storeId } = req.params as any;
    const store = await prisma.store.findFirst({ where: { id: storeId, userId } });
    if (!store) return reply.code(403).send({ error: "Unauthorized" });
    return prisma.order.findMany({
      where: { storeId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  });

  // Update order status
  app.patch("/:id/status", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id: userId } = req.user as any;
    const { id } = req.params as any;
    const { status } = req.body as any;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { store: true },
    });
    if (!order || order.store.userId !== userId)
      return reply.code(403).send({ error: "Unauthorized" });
    return prisma.order.update({ where: { id }, data: { status } });
  });
}