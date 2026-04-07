const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:masoud78622@postgresql.railway.internal:5432/railway"
    }
  }
});

async function list() {
  console.log("👥 Fetching users from the database...");
  try {
    const users = await prisma.user.findMany({
      select: { email: true, plan: true }
    });
    console.log(`Found ${users.length} users.`);
    users.forEach(u => console.log(`- ${u.email} [${u.plan}]`));
  } catch (err) {
    console.error("❌ Failed to list users.");
    console.error(err.message);
  } finally {
    await prisma.$disconnect();
  }
}

list();
