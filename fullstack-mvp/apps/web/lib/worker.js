const { Worker, Queue } = require("bullmq");
const Redis = require("ioredis");
const pino = require("pino");
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");

const logger = pino({ level: process.env.LOG_LEVEL || "info", base: undefined });
const connection = new Redis(process.env.REDIS_URL);
const prisma = new PrismaClient();

const dlq = new Queue("deployments-dlq", { connection });

const worker = new Worker(
  "deployments",
  async (job) => {
    const { deploymentId, projectId } = job.data || {};
    await prisma.deployment.update({ where: { id: deploymentId }, data: { status: "running" } });
    const base = process.env.MCP_CONNECTOR_URL || "http://mcp-connector:4001";
    let url = null;
    try {
      const resp = await axios.post(`${base}/generate`, {
        endpoint: process.env.MCP_ENDPOINT || `${base}/health`,
        apiKey: process.env.MCP_API_KEY || "none",
        payload: { projectId }
      });
      url = resp.data && resp.data.url ? resp.data.url : null;
      await prisma.deployment.update({ where: { id: deploymentId }, data: { status: "succeeded", url } });
      logger.info({ jobId: job.id, deploymentId }, "deployment succeeded");
    } catch (err) {
      await prisma.deployment.update({ where: { id: deploymentId }, data: { status: "failed" } });
      throw err;
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "deployment completed");
});

worker.on("failed", async (job, err) => {
  logger.error({ jobId: job?.id, err: err?.message }, "deployment failed");
  if (job && job.attemptsMade >= job.opts.attempts) {
    await dlq.add("failed-deployment", { data: job.data, reason: err?.message });
    logger.warn({ jobId: job.id }, "moved to DLQ");
  }
});