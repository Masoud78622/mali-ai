import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import dotenv from "dotenv";
dotenv.config();

const app = Fastify({ logger: true });

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

// Start
const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3001, host: "0.0.0.0" });
    console.log("🚀 API running on port", process.env.PORT || 3001);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();