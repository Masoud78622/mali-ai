const axios = require("axios");

const API_BASE = "https://mali-ai-production.up.railway.app";
const STORE_SUBDOMAIN = "zmvn1qdhi9"; // Using an existing subdomain
const REQS_COUNT = 50;

async function runBenchmark() {
  console.log(`🚀 Benchmarking Mali AI Platform...`);
  console.log(`🔗 Target API: ${API_BASE}`);
  console.log(`📦 Testing 50 concurrent visitors + order simulation...\n`);

  const results = {
    storeFetch: [],
    viewIncr: [],
    orderCreate: []
  };

  const start = Date.now();

  // 1. Simulate Store Fetches (High Traffic)
  const storeFetches = Array(REQS_COUNT).fill(0).map(async (_, i) => {
    const s = Date.now();
    try {
      await axios.get(`${API_BASE}/api/stores/subdomain/${STORE_SUBDOMAIN}`);
      return { success: true, time: Date.now() - s };
    } catch (e) {
      return { success: false, time: Date.now() - s, error: e.message };
    }
  });

  // 2. Simulate View Increments (Concurrent DB writes)
  const viewIncrs = Array(REQS_COUNT).fill(0).map(async (_, i) => {
    const s = Date.now();
    try {
      await axios.post(`${API_BASE}/api/stores/subdomain/${STORE_SUBDOMAIN}/increment-views`);
      return { success: true, time: Date.now() - s };
    } catch (e) {
      return { success: false, time: Date.now() - s, error: e.message };
    }
  });

  // 3. Simulate Orders (Heavier logic)
  const orderCreates = Array(5).fill(0).map(async (_, i) => {
    const s = Date.now();
    try {
      await axios.post(`${API_BASE}/api/orders/manual-create`, {
        storeId: "cm916sqs0000alv2h8z1lznf1", // Example ID
        customerName: "Stress Test Bot",
        customerEmail: "bot@mali.ai",
        customerPhone: "9999999999",
        customerAddress: { address: "Test street 1", upiId: "bot@upi" },
        paymentMethod: "COD",
        items: [{ productId: "cm916sqtp000clv2hgt608z45", title: "Test Product", price: 100, quantity: 1 }]
      });
      return { success: true, time: Date.now() - s };
    } catch (e) {
      return { success: false, time: Date.now() - s, error: e.message };
    }
  });

  const [storeRes, viewRes, orderRes] = await Promise.all([
    Promise.all(storeFetches),
    Promise.all(viewIncrs),
    Promise.all(orderCreates)
  ]);

  const totalTime = Date.now() - start;

  function summarize(name, res) {
    const successes = res.filter(r => r.success);
    const avgTime = successes.reduce((acc, r) => acc + r.time, 0) / (successes.length || 1);
    console.log(`[${name}]`);
    console.log(`- Success: ${successes.length}/${res.length}`);
    console.log(`- Avg Time: ${avgTime.toFixed(2)}ms`);
    if (res.length > successes.length) {
      console.log(`- Failures: ${res.length - successes.length} (Example: ${res.find(r => !r.success).error})`);
    }
    console.log("");
  }

  summarize("Store Fetches", storeRes);
  summarize("View Increments", viewRes);
  summarize("Order Creations", orderRes);

  console.log(`✅ Completed in ${totalTime}ms`);
}

runBenchmark().catch(console.error);
