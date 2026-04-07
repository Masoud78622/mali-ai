import { prisma } from "./packages/db/src/index";

async function upgrade() {
  const email = "masudshaikh@gmail.com";
  console.log(`🚀 Upgrading user: ${email} to PRO plan...`);
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { plan: "PRO" },
    });
    console.log(`✅ Success! User ${user.email} is now on the ${user.plan} plan.`);
  } catch (err) {
    console.error("❌ Upgrade failed. User might not exist or database connection error.");
    console.error(err.message);
  } finally {
    await prisma.$disconnect();
  }
}

upgrade();
