import * as redis from "redis";

const createRedisClient = () => {
  return redis.createClient({
    socket: {
      host: "localhost",
      port: 6379,
    },
  });
};

const redisPubClient = createRedisClient();
const redisSubClient = createRedisClient();

redisPubClient.on("error", (err: Error) => {
  console.error("Redis Pub client connection error:", err);
  process.exit(1);
});

redisSubClient.on("error", (err: Error) => {
  console.error("Redis Sub client connection error:", err);
  process.exit(1);
});

redisPubClient.on("connect", () => {
  console.log("Connected to Redis Pub client");
});

redisSubClient.on("connect", () => {
  console.log("Connected to Redis Sub client");
});

async function connectToRedisPubSub(): Promise<void> {
  await redisPubClient.connect();
  await redisSubClient.connect();
}

export { redisPubClient, redisSubClient, connectToRedisPubSub };
