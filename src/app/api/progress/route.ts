import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { articleId, completed } = await req.json();

  const progress = await db.progress.upsert({
    where: { userId_articleId: { userId: session.user.id, articleId } },
    create: {
      userId: session.user.id,
      articleId,
      completed: completed ?? true,
      readAt: new Date(),
    },
    update: {
      completed: completed ?? true,
      readAt: new Date(),
    },
  });

  return NextResponse.json(progress);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const progresses = await db.progress.findMany({
    where: { userId: session.user.id },
    include: {
      article: {
        select: { id: true, title: true, slug: true, readTime: true, category: { select: { name: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(progresses);
}
