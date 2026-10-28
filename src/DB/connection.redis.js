import { createClient } from "redis";

export const redis_client=createClient({
    url: 'rediss://default:gQAAAAAAA2GcAAIgcDE4MzA2ZWQxYmVmOTQ0ZjAzYjJiMmJjNjc3ZGQ2NDU1OA@destined-raven-221596.upstash.io:6379',
});

export default async function connectionRedis() {
    try {
        await redis_client.connect();
        console.log("Redis connected successfully");
        
    } catch (error) {
        console.log("Redis connected faild");
    }
}