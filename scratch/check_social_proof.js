const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkViews() {
  const store = await prisma.store.findFirst({
    include: { products: true }
  });
  if (!store) {
    console.log("No stores found.");
    process.exit(1);
  }
  console.log(`STORE_ID: ${store.id}`);
  console.log(`SUBDOMAIN: ${store.subdomain}`);
  store.products.slice(0, 3).forEach(p => {
    console.log(`PRODUCT_ID: ${p.id} | TITLE: ${p.title}`);
  });
  process.exit(0);
}

checkViews().catch(e => { console.error(e); process.exit(1); });
