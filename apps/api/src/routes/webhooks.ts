import { FastifyInstance } from "fastify";
import { prisma } from "@mali-ai/db";
import crypto from "crypto";
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendWhatsApp(to: string, message: string) {
  try {
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886",
      to: `whatsapp:+91${to}`,
      body: message,
    });
  } catch (err) {
    console.error("WhatsApp error:", err);
  }
}

export default async function webhookRoutes(app: FastifyInstance) {
  // Razorpay payment webhook
  app.post("/razorpay", async (req, reply) => {
    const signature = req.headers["x-razorpay-signature"] as string;
    const body = JSON.stringify(req.body);

    if (!process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET === "xxx") {
      console.error("❌ RAZORPAY_WEBHOOK_SECRET is missing or invalid");
      return reply.code(500).send({ error: "Webhook configuration error" });
    }

    // Verify signature
    try {
      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");

      if (signature !== expected) {
        console.warn("⚠️ Invalid Razorpay signature received");
        return reply.code(400).send({ error: "Invalid signature" });
      }
    } catch (err) {
      console.error("❌ Error verifying Razorpay signature:", err);
      return reply.code(500).send({ error: "Signature verification failed" });
    }

    const event = req.body as any;

    if (event.event === "payment.captured") {
      const paymentId = event.payload.payment.entity.id;
      const razorpayOrderId = event.payload.payment.entity.order_id;

      // Find and update order
      const order = await prisma.order.findFirst({
        where: { razorpayOrderId },
        include: {
          store: {
            include: { user: true },
          },
          items: true,
        },
      });

      if (!order) return reply.code(404).send({ error: "Order not found" });

      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID", razorpayPaymentId: paymentId },
      });

      // Send WhatsApp to store owner
      const owner = order.store.user;
      const whatsappNumber = owner.whatsappNumber || owner.phone;

      if (whatsappNumber && !order.whatsappSent) {
        const itemsList = order.items
          .map((i) => `• ${i.title} x${i.quantity} = ₹${Number(i.price) * i.quantity}`)
          .join("\n");

        await sendWhatsApp(
          whatsappNumber,
          `🛍️ *New Order on ${order.store.name}!*\n\n` +
          `Order ID: ${order.id}\n` +
          `Customer: ${order.customerName}\n` +
          `Phone: ${order.customerPhone || "N/A"}\n\n` +
          `*Items:*\n${itemsList}\n\n` +
          `*Total: ₹${order.total}*\n\n` +
          `Login to your dashboard to manage this order.`
        );

        await prisma.order.update({
          where: { id: order.id },
          data: { whatsappSent: true },
        });
      }
    }

    return { received: true };
  });
}