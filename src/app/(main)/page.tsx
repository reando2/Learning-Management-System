import { db } from "@/lib/db";
import Link from "next/link";
import { BookOpen, Clock, Eye, ArrowRight, Zap, Users, Award } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "LearningHub — Platform Pembelajaran Online",
  description: "Platform pembelajaran online terbaik dengan ribuan artikel berkualitas tinggi.",
};

async function getHomeData() {
  const [articles, categories, stats] = await Promise.all([
    db.article.findMany({
      where: { published: true },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { comments: true, progresses: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.category.findMany({
      include: { _count: { select: { articles: true } } },
      take: 6,
    }),
    Promise.all([
      db.article.count({ where: { published: true } }),
      db.user.count(),
      db.progress.count({ where: { completed: true } }),
    ]),
  ]);

  return { articles, categories, stats };
}

export default async function HomePage() {
  const { articles, categories, stats } = await getHomeData();
  const [totalArticles, totalUsers, totalCompleted] = stats;

  return (
    <div>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <Zap size={12} />
              Platform Pembelajaran Terlengkap
            </div>
            <h1 className={styles.heroTitle}>
              Tingkatkan Skill Anda
              <br />
              <span className={styles.heroTitleAccent}>Bersama Ahlinya</span>
            </h1>
            <p className={styles.heroDesc}>
              Akses ribuan artikel pembelajaran berkualitas tinggi, pantau progress belajar Anda,
              dan bergabung dengan komunitas pelajar digital yang terus berkembang.
            </p>
            <div className={styles.heroCta}>
              <Link href="/register" className="btn btn-primary btn-lg">
                Mulai Belajar Gratis
                <ArrowRight size={18} />
              </Link>
              <Link href="/articles" className="btn btn-secondary btn-lg">
                Jelajahi Artikel
              </Link>
            </div>

            {/* Stats */}
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>{totalArticles}+</span>
                <span className={styles.heroStatLabel}>Artikel</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>{totalUsers}+</span>
                <span className={styles.heroStatLabel}>Pelajar</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>{totalCompleted}+</span>
                <span className={styles.heroStatLabel}>Materi Selesai</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className={styles.heroVisual}>
            <div className={styles.heroCard}>
              <div className={styles.heroCardHeader}>
                <div className={styles.heroCardDots}>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className={styles.heroCardBody}>
                <div className={styles.heroCodeLine}>
                  <span className={styles.codeKeyword}>const</span>
                  <span className={styles.codeVar}> learning</span>
                  <span> = </span>
                  <span className={styles.codeStr}>&#39;LearningHub&#39;</span>
                </div>
                <div className={styles.heroCodeLine}>
                  <span className={styles.codeKeyword}>function</span>
                  <span className={styles.codeFunc}> improve</span>
                  <span>(skill) &#123;</span>
                </div>
                <div className={styles.heroCodeLine} style={{paddingLeft: "1.5em"}}>
                  <span className={styles.codeKeyword}>return</span>
                  <span className={styles.codeStr}> skill + 100</span>
                </div>
                <div className={styles.heroCodeLine}>&#125;</div>
                <div className={styles.heroCodeLine} style={{marginTop: "0.5em"}}>
                  <span className={styles.codeComment}>// Start learning today!</span>
                </div>
              </div>
            </div>

            <div className={styles.heroFloatCard1}>
              <Award size={16} />
              <span>Certified Learning</span>
            </div>
            <div className={styles.heroFloatCard2}>
              <Users size={14} />
              <span>{totalUsers} Aktif</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featureGrid}>
            <div className={`${styles.featureItem} card`}>
              <div className={styles.featureIcon}><BookOpen size={20} /></div>
              <h3 className={styles.featureTitle}>Konten Berkualitas</h3>
              <p className={styles.featureDesc}>Artikel ditulis oleh para ahli, mudah dipahami dan langsung bisa dipraktikkan.</p>
            </div>
            <div className={`${styles.featureItem} card`}>
              <div className={styles.featureIcon}><Zap size={20} /></div>
              <h3 className={styles.featureTitle}>Progress Tracking</h3>
              <p className={styles.featureDesc}>Pantau kemajuan belajar Anda secara real-time dengan dashboard personal.</p>
            </div>
            <div className={`${styles.featureItem} card`}>
              <div className={styles.featureIcon}><Users size={20} /></div>
              <h3 className={styles.featureTitle}>Komunitas Aktif</h3>
              <p className={styles.featureDesc}>Diskusi dan komentar bersama pelajar lain untuk saling bertukar ilmu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Jelajahi Kategori</h2>
              <Link href="/categories" className="btn btn-ghost btn-sm">
                Lihat Semua <ArrowRight size={14} />
              </Link>
            </div>
            <div className={styles.categoryGrid}>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/categories/${cat.slug}`} className={`${styles.categoryCard} card`}>
                  <p className={styles.categoryName}>{cat.name}</p>
                  <p className={styles.categoryCount}>{cat._count.articles} artikel</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Artikel Terbaru</h2>
            <Link href="/articles" className="btn btn-ghost btn-sm">
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>

          {articles.length === 0 ? (
            <div className={styles.emptyState}>
              <BookOpen size={48} />
              <p>Belum ada artikel yang dipublikasikan.</p>
            </div>
          ) : (
            <div className="grid-articles">
              {articles.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`} className={`${styles.articleCard} card`}>
                  <div className={styles.articleCardInner}>
                    {article.category && (
                      <span className={`badge badge-default`}>{article.category.name}</span>
                    )}
                    <h3 className={styles.articleTitle}>{article.title}</h3>
                    <p className={styles.articleExcerpt}>
                      {article.excerpt ? truncate(article.excerpt, 100) : truncate(article.content.replace(/<[^>]*>/g, ""), 100)}
                    </p>
                    <div className={styles.articleMeta}>
                      <div className={styles.articleAuthor}>
                        <div className={styles.authorAvatar}>
                          {article.author.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{article.author.name}</span>
                      </div>
                      <div className={styles.articleStats}>
                        <span className={styles.articleStat}>
                          <Clock size={12} /> {article.readTime} min
                        </span>
                        <span className={styles.articleStat}>
                          <Eye size={12} /> {article.views}
                        </span>
                      </div>
                    </div>
                    <p className={styles.articleDate}>{formatDate(article.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>Siap Mulai Belajar?</h2>
            <p className={styles.ctaDesc}>
              Bergabung sekarang dan dapatkan akses penuh ke semua materi pembelajaran.
            </p>
            <Link href="/register" className="btn btn-primary btn-lg">
              Daftar Gratis Sekarang
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
