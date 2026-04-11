import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Eye, Calendar, ArrowLeft, Tag, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CommentSection from "@/components/shared/CommentSection";
import MarkCompleteButton from "@/components/shared/MarkCompleteButton";
import styles from "./page.module.css";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug, published: true },
    select: { title: true, excerpt: true },
  });

  return {
    title: article?.title ?? "Artikel",
    description: article?.excerpt ?? undefined,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const article = await db.article.findUnique({
    where: { slug, published: true },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
      tags: { include: { tag: { select: { name: true, slug: true } } } },
      comments: {
        where: { approved: true },
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { comments: true } },
    },
  });

  if (!article) notFound();

  // Increment views
  await db.article.update({ where: { id: article.id }, data: { views: { increment: 1 } } });

  // Check user progress
  const userProgress = session
    ? await db.progress.findUnique({
        where: { userId_articleId: { userId: session.user.id, articleId: article.id } },
      })
    : null;

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: "64px" }}>
        <div className={styles.page}>
          {/* Back */}
          <div className="container">
            <Link href="/articles" className="btn btn-ghost btn-sm" style={{ marginBottom: "24px", display: "inline-flex" }}>
              <ArrowLeft size={14} /> Semua Artikel
            </Link>

            <div className={styles.layout}>
              {/* Main Content */}
              <article className={styles.article}>
                {/* Category & Tags */}
                <div className={styles.articleMeta}>
                  {article.category && (
                    <Link href={`/categories/${article.category.slug}`} className="badge badge-default">
                      {article.category.name}
                    </Link>
                  )}
                  {article.tags.map(({ tag }) => (
                    <Link key={tag.slug} href={`/articles?tag=${tag.slug}`} className="tag">
                      <Tag size={10} /> {tag.name}
                    </Link>
                  ))}
                </div>

                <h1 className={styles.articleTitle}>{article.title}</h1>

                {article.excerpt && (
                  <p className={styles.articleExcerpt}>{article.excerpt}</p>
                )}

                <div className={styles.articleInfo}>
                  <div className={styles.articleAuthor}>
                    <div className={styles.authorAvatar}>{article.author.name.charAt(0).toUpperCase()}</div>
                    <span>{article.author.name}</span>
                  </div>
                  <div className={styles.articleStats}>
                    <span><Clock size={14} /> {article.readTime} menit baca</span>
                    <span><Eye size={14} /> {article.views} views</span>
                    <span><Calendar size={14} /> {formatDate(article.createdAt)}</span>
                  </div>
                </div>

                <hr className="divider" />

                {/* Content */}
                <div className={`prose ${styles.content}`} dangerouslySetInnerHTML={{ __html: article.content }} />

                <hr className="divider" />

                {/* Complete Button */}
                {session && (
                  <MarkCompleteButton
                    articleId={article.id}
                    isCompleted={userProgress?.completed ?? false}
                  />
                )}

                {/* Comments */}
                <CommentSection
                  articleId={article.id}
                  comments={article.comments}
                  isLoggedIn={!!session}
                />
              </article>

              {/* Sidebar */}
              <aside className={styles.sidebar}>
                <div className={styles.sideCard}>
                  <p className={styles.sideTitle}>Tentang Artikel</p>
                  <div className={styles.sideInfoList}>
                    <div className={styles.sideInfoItem}>
                      <span className={styles.sideInfoLabel}>Penulis</span>
                      <span className={styles.sideInfoValue}>{article.author.name}</span>
                    </div>
                    <div className={styles.sideInfoItem}>
                      <span className={styles.sideInfoLabel}>Kategori</span>
                      <span className={styles.sideInfoValue}>{article.category?.name ?? "—"}</span>
                    </div>
                    <div className={styles.sideInfoItem}>
                      <span className={styles.sideInfoLabel}>Waktu Baca</span>
                      <span className={styles.sideInfoValue}>{article.readTime} menit</span>
                    </div>
                    <div className={styles.sideInfoItem}>
                      <span className={styles.sideInfoLabel}>Komentar</span>
                      <span className={styles.sideInfoValue}>{article._count.comments}</span>
                    </div>
                  </div>
                </div>

                {userProgress?.completed && (
                  <div className={styles.completedBadge}>
                    <CheckCircle size={16} color="var(--success)" />
                    <span>Artikel ini sudah selesai dibaca</span>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
