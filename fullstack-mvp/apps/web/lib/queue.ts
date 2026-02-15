import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL as string);

export const deployQueue = new Queue("deployments", {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 2000
    },
    removeOnComplete: 1000,
    removeOnFail: false
  }
});
