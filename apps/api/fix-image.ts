import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { images: { equals: [] } },
    orderBy: { createdAt: 'desc' },
    take: 1
  });

  if (products.length === 0) {
    console.log("No product with missing image found.");
    return;
  }

  const p = products[0];
  console.log(`Fixing product: ${p.title}`);
  
  const updated = await prisma.product.update({
    where: { id: p.id },
    data: { images: ["https://femora.in/cdn/shop/files/FMBNNSHSBL-SK-02_1.jpg?v=1726145136&width=713"] }
  });

  console.log(`✅ Success! Updated product ${updated.id} with the Femora image.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
