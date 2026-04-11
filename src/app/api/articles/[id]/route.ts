import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import slugify from "slugify";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await db.article.findFirst({
    where: { OR: [{ id }, { slug: id }], published: true },
    include: {
      author: { select: { name: true, id: true } },
      category: { select: { name: true, slug: true } },
      tags: { include: { tag: { select: { name: true, slug: true } } } },
      comments: {
        where: { approved: true },
        include: { author: { select: { name: true, id: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!article) return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });

  // Increment views
  await db.article.update({ where: { id: article.id }, data: { views: { increment: 1 } } });

  return NextResponse.json(article);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title, content, excerpt, categoryId, tagIds, published, readTime } = body;

  try {
    // Delete existing tags
    await db.articleTag.deleteMany({ where: { articleId: id } });

    let slug: string | undefined;
    if (title) {
      slug = slugify(title, { lower: true, strict: true });
      const existing = await db.article.findFirst({ where: { slug, NOT: { id } } });
      if (existing) slug = `${slug}-${Date.now()}`;
    }

    const article = await db.article.update({
      where: { id },
      data: {
        ...(title && { title, slug }),
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(published !== undefined && { published }),
        ...(readTime !== undefined && { readTime }),
        categoryId: categoryId || null,
        tags: tagIds?.length
          ? { create: tagIds.map((tagId: string) => ({ tagId })) }
          : undefined,
      },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.article.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
