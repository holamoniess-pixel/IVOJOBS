import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL as string);

export const deployDLQ = new Queue("deployments-dlq", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: false
  }
});
