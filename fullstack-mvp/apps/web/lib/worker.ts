import { Worker } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL as string);

new Worker(
  "deployments",
  async (job) => {
    console.log("Processing deployment:", job.data);
    // TODO: Call MCP connector here
  },
  { connection }
);
