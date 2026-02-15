import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL as string);

export async function GET() {
  const db = await prisma.$queryRaw`SELECT 1`;
  const r = await redis.ping();
  return NextResponse.json({
    status: "ok",
    db: db ? "up" : "down",
    redis: r === "PONG" ? "up" : "down",
    timestamp: new Date().toISOString(),
  });
}
