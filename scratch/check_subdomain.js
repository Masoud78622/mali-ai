const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  try {
    const subdomain = "rc-jlvafd6";
    const store = await prisma.store.findFirst({
      where: { subdomain }
    });
    console.log("-------------------");
    if (store) {
      console.log(`✅ STORE FOUND: ${store.name} (ID: ${store.id})`);
    } else {
      console.log(`❌ STORE NOT FOUND: ${subdomain}`);
    }
    console.log("-------------------");
  } catch (err) {
    console.error("ERROR:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
