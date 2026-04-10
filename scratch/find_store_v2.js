const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  try {
    const store = await prisma.store.findFirst({
      orderBy: { createdAt: "desc" }
    });
    if (store) {
      console.log(`TARGET_SUBDOMAIN: ${store.subdomain}`);
    } else {
      console.log("NO_STORES_FOUND");
    }
  } catch (err) {
    console.error("ERROR_FETCHING_STORE:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
