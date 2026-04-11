import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { BookOpen, CheckCircle, Clock, TrendingUp, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard Saya" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;

  const [user, progresses, totalPublished] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, bio: true, createdAt: true },
    }),
    db.progress.findMany({
      where: { userId },
      include: {
        article: {
          select: { id: true, title: true, slug: true, readTime: true, category: { select: { name: true } } },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.article.count({ where: { published: true } }),
  ]);

  const completedCount = progresses.filter((p) => p.completed).length;
  const inProgressCount = progresses.filter((p) => !p.completed).length;
  const progressPercent = totalPublished > 0 ? Math.round((completedCount / totalPublished) * 100) : 0;
  const totalReadTime = progresses
    .filter((p) => p.completed)
    .reduce((acc, p) => acc + p.article.readTime, 0);

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: "64px" }}>
        <div className={styles.page}>
          <div className="container">
            {/* Page Header */}
            <div className={styles.pageHeader}>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>{user?.name.charAt(0).toUpperCase()}</div>
                <div>
                  <h1 className={styles.greeting}>Halo, {user?.name}! 👋</h1>
                  <p className={styles.greetingSub}>Terus semangat belajarnya!</p>
                </div>
              </div>
              <Link href="/dashboard/profile" className="btn btn-secondary btn-sm">
                <User size={14} /> Edit Profil
              </Link>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid}>
              <div className="stat-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p className="stat-label">Selesai Dibaca</p>
                  <CheckCircle size={18} color="var(--success)" />
                </div>
                <p className="stat-value">{completedCount}</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>dari {totalPublished} artikel</p>
              </div>

              <div className="stat-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p className="stat-label">Sedang Dibaca</p>
                  <BookOpen size={18} color="var(--info)" />
                </div>
                <p className="stat-value">{inProgressCount}</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>artikel aktif</p>
              </div>

              <div className="stat-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p className="stat-label">Total Belajar</p>
                  <Clock size={18} color="var(--warning)" />
                </div>
                <p className="stat-value">{totalReadTime}</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>menit dibaca</p>
              </div>

              <div className="stat-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p className="stat-label">Progress</p>
                  <TrendingUp size={18} color="var(--accent-muted)" />
                </div>
                <p className="stat-value">{progressPercent}%</p>
                <div className="progress-bar" style={{ marginTop: "8px" }}>
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>

            {/* Progress List */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Riwayat Belajar</h2>
              {progresses.length === 0 ? (
                <div className={styles.emptyState}>
                  <BookOpen size={40} />
                  <p>Belum ada artikel yang dibaca.</p>
                  <Link href="/articles" className="btn btn-primary">Mulai Belajar</Link>
                </div>
              ) : (
                <div className={styles.progressList}>
                  {progresses.map((p) => (
                    <Link key={p.id} href={`/articles/${p.article.slug}`} className={`${styles.progressCard} card`}>
                      <div className={styles.progressCardContent}>
                        <div>
                          {p.article.category && (
                            <span className="badge badge-default" style={{ marginBottom: "8px" }}>{p.article.category.name}</span>
                          )}
                          <p className={styles.progressTitle}>{p.article.title}</p>
                          <p className={styles.progressMeta}>
                            <Clock size={12} /> {p.article.readTime} menit
                            {p.readAt && <> · {formatDate(p.readAt)}</>}
                          </p>
                        </div>
                        <span className={`badge ${p.completed ? "badge-success" : "badge-warning"}`}>
                          {p.completed ? "✓ Selesai" : "Sedang baca"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
