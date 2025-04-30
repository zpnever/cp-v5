import Redis from "ioredis";

export const redis = new Redis({
	host: process.env.REDIS_HOST || "localhost",
	port: Number(process.env.REDIS_PORT) || 6380,
	password: process.env.REDIS_PASSWORD || undefined,
});

// const redis = new Redis(process.env.REDIS_URL!);

export default redis;
