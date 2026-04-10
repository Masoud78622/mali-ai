const { PrismaClient } = require("./packages/db");
const prisma = new PrismaClient();

async function run() {
  try {
    const store = await prisma.store.findFirst({
      orderBy: { createdAt: "desc" }
    });
    if (store) {
      console.log(`SUBDOMAIN: ${store.subdomain}`);
    } else {
      console.log("NO_STORES_FOUND");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
