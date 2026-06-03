const { extractNotice } = require('./services/ai');
const db = require('./database');

async function test() {
  console.log("Testing AI Extraction...");
  const text = "The final deadline to pay the upcoming semester fee without late charges is May 20, 2026. Please pay on the portal.";
  const res = await extractNotice(text);
  console.log("AI Result:", res);
}
test();