const axios = require("axios");

async function testScalability(url) {
  console.log(`🚀 Starting Stress Test for: ${url}`);
  const startTime = Date.now();
  const requests = Array(20).fill(0).map((_, i) => {
    return axios.get(url, { timeout: 10000 }).then(res => ({
      id: i + 1,
      status: res.status,
      time: Date.now() - startTime,
      cache: res.headers["x-vercel-cache"] || "MISS/NONE"
    })).catch(err => ({
      id: i + 1,
      status: "ERROR",
      error: err.message
    }));
  });

  const results = await Promise.all(requests);
  console.table(results);
  
  const successes = results.filter(r => r.status === 200);
  const hits = results.filter(r => r.cache === "HIT");
  
  console.log(`📊 SUMMARY:`);
  console.log(`- Total Requests: 20`);
  console.log(`- Successes: ${successes.length}`);
  console.log(`- Cache HITS: ${hits.length}`);
  console.log(`- Avg Time: ${successes.reduce((acc, r) => acc + r.time, 0) / (successes.length || 1)}ms`);
}

const target = "https://zmvn1qdhi9.mali-ai.shop";
testScalability(target);
