import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "@mali-ai/db";

export default async function authRoutes(app: FastifyInstance) {
  // Register
  app.post("/register", async (req, reply) => {
    const { email, password, name } = req.body as any;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return reply.code(400).send({ error: "Email already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
    });
    const token = app.jwt.sign({ id: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan } };
  });

  // Login
  app.post("/login", async (req, reply) => {
    const { email, password } = req.body as any;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return reply.code(401).send({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return reply.code(401).send({ error: "Invalid credentials" });
    const token = app.jwt.sign({ id: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan } };
  });

  // Me
  app.get("/me", { preHandler: [app.authenticate] }, async (req) => {
    const { id } = req.user as any;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, plan: true, whatsappNumber: true },
    });
    return user;
  });

  // Update profile
  app.put("/me", { preHandler: [app.authenticate] }, async (req) => {
    const { id } = req.user as any;
    const { name, whatsappNumber, phone } = req.body as any;
    const user = await prisma.user.update({
      where: { id },
      data: { name, whatsappNumber, phone },
    });
    return { id: user.id, email: user.email, name: user.name, plan: user.plan };
  });
}