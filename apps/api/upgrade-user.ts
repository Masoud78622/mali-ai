import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "masoudshaikh@gmail.com";
  console.log(`Searching for user: ${email}...`);
  
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.error("User not found!");
    return;
  }

  console.log("Current user plan:", user.plan);
  
  const updated = await prisma.user.update({
    where: { email },
    data: { plan: "PRO" }
  });

  console.log(`✅ Success! Updated user ${updated.email} to ${updated.plan} plan.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
