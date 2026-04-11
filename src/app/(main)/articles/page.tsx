import { db } from "@/lib/db";
import Link from "next/link";
import { BookOpen, Clock, Eye, Search } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Semua Artikel",
  description: "Jelajahi semua artikel pembelajaran yang tersedia di LearningHub.",
};

interface Props {
  searchParams: Promise<{ category?: string; tag?: string; search?: string }>;
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { category, tag, search } = await searchParams;

  const where: Record<string, unknown> = { published: true };
  if (category) where.category = { slug: category };
  if (tag) where.tags = { some: { tag: { slug: tag } } };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
    ];
  }

  const [articles, categories] = await Promise.all([
    db.article.findMany({
      where,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Semua Artikel</h1>
            <p className={styles.pageSubtitle}>{articles.length} artikel tersedia</p>
          </div>
        </div>

        {/* Search */}
        <form className={styles.searchForm} method="GET">
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              name="search"
              className="input"
              placeholder="Cari artikel..."
              defaultValue={search}
              style={{ paddingLeft: "40px" }}
            />
          </div>
          <button type="submit" className="btn btn-primary">Cari</button>
          {search && (
            <Link href="/articles" className="btn btn-ghost">Reset</Link>
          )}
        </form>

        {/* Category Filters */}
        <div className={styles.categoryFilters}>
          <Link href="/articles" className={`tag ${!category ? "active" : ""}`}>
            Semua
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/articles?category=${cat.slug}`}
              className={`tag ${category === cat.slug ? "active" : ""}`}
            >
              {cat.name} ({cat._count.articles})
            </Link>
          ))}
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className={styles.emptyState}>
            <BookOpen size={48} />
            <p>Tidak ada artikel ditemukan.</p>
            <Link href="/articles" className="btn btn-secondary">Lihat Semua</Link>
          </div>
        ) : (
          <div className="grid-articles">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className={`${styles.articleCard} card`}
              >
                <div className={styles.articleBody}>
                  {article.category && (
                    <span className="badge badge-default">{article.category.name}</span>
                  )}
                  <h2 className={styles.articleTitle}>{article.title}</h2>
                  <p className={styles.articleExcerpt}>
                    {article.excerpt
                      ? truncate(article.excerpt, 110)
                      : truncate(article.content.replace(/<[^>]*>/g, ""), 110)}
                  </p>
                  <div className={styles.articleMeta}>
                    <div className={styles.authorInfo}>
                      <div className={styles.authorAvatar}>
                        {article.author.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{article.author.name}</span>
                    </div>
                    <div className={styles.articleStats}>
                      <span><Clock size={12} /> {article.readTime} min</span>
                      <span><Eye size={12} /> {article.views}</span>
                    </div>
                  </div>
                  <p className={styles.articleDate}>{formatDate(article.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
