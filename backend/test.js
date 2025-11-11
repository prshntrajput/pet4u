// test.js
import "dotenv/config";
import { createClient } from "redis";

console.log("🔑 REDIS_URL =", process.env.REDIS_URL);

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    family: 4, // ✅ Force IPv4
  },
});

client.on("error", (err) => console.error("❌ Redis Client Error", err));
client.on("connect", () => console.log("🔗 Connected to Redis..."));
client.on("ready", () => console.log("✅ Redis is ready!"));

(async () => {
  try {
    await client.connect();
    console.log("🚀 Connected!");

    await client.set("test-key", "Hello from Node.js!");
    const value = await client.get("test-key");
    console.log("📦 Value from Redis:", value);

    await client.quit();
  } catch (err) {
    console.error("⚠️ Error connecting to Redis:", err);
  }
})();
