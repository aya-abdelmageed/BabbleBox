import { createClient } from "redis";

export async function connectRedis() {
  const client = createClient();
  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();
  console.log("Connected to Redis");

  return client;
}

const redisClient = createClient();

export default redisClient;
