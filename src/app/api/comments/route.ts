import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, articleId } = await req.json();
  if (!content || !articleId) {
    return NextResponse.json({ error: "Konten dan artikel wajib diisi" }, { status: 400 });
  }

  const comment = await db.comment.create({
    data: { content, articleId, authorId: session.user.id, approved: false },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const approved = searchParams.get("approved");

  const comments = await db.comment.findMany({
    where: approved !== null ? { approved: approved === "true" } : undefined,
    include: {
      author: { select: { name: true, email: true } },
      article: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}
