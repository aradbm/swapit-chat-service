import * as redis from "redis";

// const redisUrl = "redis://redis:6379";

const redisClient = redis.createClient({
  socket: {
    host: "localhost",
    port: 6379,
  },
});

redisClient.on("error", (err: Error) => {
  console.error("Redis connection error:", err);
  process.exit(1);
});

redisClient.on("connect", async () => {
  console.log("Connected to Redis");
});

async function initializeRedis() {
  await redisClient.connect();
}

export { redisClient, initializeRedis };
