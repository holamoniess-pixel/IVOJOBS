const express = require("express");
const axios = require("axios");
const pino = require("pino");

const app = express();
const logger = pino({ level: process.env.LOG_LEVEL || "info", base: undefined });
app.use(express.json());

app.post("/generate", async (req, res) => {
  const { endpoint, apiKey, payload } = req.body;
  try {
    const response = await axios.post(endpoint, payload, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    res.json(response.data);
  } catch (err) {
    logger.error({ err: err.message }, "mcp request failed");
    res.status(500).json({ error: "MCP request failed" });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(4001, () => {
  logger.info("MCP Connector running on port 4001");
});
