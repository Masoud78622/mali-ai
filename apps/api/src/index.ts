import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import dotenv from "dotenv";
import { prisma } from "@mali-ai/db";
dotenv.config();

// Global Error Handlers
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  console.error(err.stack);
  // Give the logger a chance to flush before exiting
  setTimeout(() => process.exit(1), 100);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

const app = Fastify({ 
  logger: true
});

// Plugins
app.register(cors, { origin: true });
app.register(jwt, { secret: process.env.JWT_SECRET || "mali-ai-secret" });
app.register(multipart);

app.decorate("authenticate", async (req: any, reply: any) => {
  try {
    await req.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Health check
app.get("/health", async () => ({
  status: "ok",
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
}));

// Routes
import authRoutes from "./routes/auth";
import storeRoutes from "./routes/stores";
import productRoutes from "./routes/products";
import orderRoutes from "./routes/orders";
import webhookRoutes from "./routes/webhooks";

app.register(authRoutes, { prefix: "/api/auth" });
app.register(storeRoutes, { prefix: "/api/stores" });
app.register(productRoutes, { prefix: "/api/products" });
app.register(orderRoutes, { prefix: "/api/orders" });
app.register(webhookRoutes, { prefix: "/api/webhooks" });

// Graceful Shutdown
const signals = ["SIGINT", "SIGTERM"];
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
    await app.close();
    await prisma.$disconnect();
    console.log("👋 Shutdown complete");
    process.exit(0);
  });
});

// Environment Validation
const validateEnv = () => {
  const critical = ["DATABASE_URL", "AI_API_KEY", "JWT_SECRET"];
  critical.forEach((key) => {
    if (!process.env[key] || process.env[key] === "xxx") {
      console.warn(`⚠️  Warning: environment variable ${key} is missing or set to placeholder 'xxx'`);
    }
  });
};

// Start
const start = async () => {
  try {
    validateEnv();
    
    // DB Check
    console.log("🔌 Connecting to database...");
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Initialize WhatsApp
    console.log("🔗 Connecting to WhatsApp...");
    const { initWhatsApp } = require("./utils/whatsapp");
    initWhatsApp().catch((err: any) => console.error("❌ WhatsApp Init Error:", err));

    await app.listen({ port: Number(process.env.PORT) || 3001, host: "0.0.0.0" });
    console.log("🚀 API running on port", process.env.PORT || 3001);
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

start();