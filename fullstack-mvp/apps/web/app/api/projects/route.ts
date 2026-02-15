import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { deployQueue } from "@/lib/queue";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const project = await prisma.project.create({
    data: {
      name: body.name,
      userId: body.userId
    }
  });
  const deployment = await prisma.deployment.create({
    data: { projectId: project.id, status: "queued" }
  });
  await deployQueue.add("deploy", { projectId: project.id, deploymentId: deployment.id });
  return NextResponse.json({ project, deployment });
}