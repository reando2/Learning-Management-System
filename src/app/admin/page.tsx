import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { FileText, Users, MessageSquare, Eye, TrendingUp, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard Admin" };

export default async function AdminDashboardPage() {
  const session = await auth();

  const [
    totalArticles,
    publishedArticles,
    totalUsers,
    totalComments,
    pendingComments,
    totalViews,
    recentArticles,
    recentUsers,
  ] = await Promise.all([
    db.article.count(),
    db.article.count({ where: { published: true } }),
    db.user.count(),
    db.comment.count(),
    db.comment.count({ where: { approved: false } }),
    db.article.aggregate({ _sum: { views: true } }),
    db.article.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true } } },
    }),
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  const stats = [
    { label: "Total Artikel", value: totalArticles, sub: `${publishedArticles} dipublikasikan`, icon: FileText },
    { label: "Total Pengguna", value: totalUsers, sub: "Terdaftar", icon: Users },
    { label: "Total Komentar", value: totalComments, sub: `${pendingComments} menunggu review`, icon: MessageSquare },
    { label: "Total Views", value: totalViews._sum.views ?? 0, sub: "Semua artikel", icon: Eye },
  ];

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Selamat datang kembali, {session?.user?.name}!</p>
        </div>
        <Link href="/admin/articles/new" className="btn btn-primary">
          <FileText size={16} />
          Tulis Artikel
        </Link>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div className={styles.statHeader}>
                <p className="stat-label">{s.label}</p>
                <div className={styles.statIcon}><Icon size={16} /></div>
              </div>
              <p className="stat-value">{s.value.toLocaleString("id-ID")}</p>
              <p className={styles.statSub}>{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Pending Comments Alert */}
      {pendingComments > 0 && (
        <div className={styles.alert}>
          <MessageSquare size={16} />
          <span>Ada <strong>{pendingComments} komentar</strong> yang menunggu moderasi</span>
          <Link href="/admin/comments" className="btn btn-secondary btn-sm">
            Review Sekarang
          </Link>
        </div>
      )}

      {/* Recent Data */}
      <div className={styles.recentGrid}>
        {/* Recent Articles */}
        <div>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Artikel Terbaru</h2>
            <Link href="/admin/articles" className="btn btn-ghost btn-sm">Lihat semua</Link>
          </div>
          <div className={styles.dataCard}>
            {recentArticles.map((article) => (
              <div key={article.id} className={styles.dataRow}>
                <div className={styles.dataRowContent}>
                  <p className={styles.dataTitle}>{article.title}</p>
                  <div className={styles.dataMeta}>
                    {article.category && <span className="badge badge-default">{article.category.name}</span>}
                    <span className={`badge ${article.published ? "badge-success" : "badge-warning"}`}>
                      {article.published ? "Publik" : "Draft"}
                    </span>
                    <span className={styles.dataDate}>{formatDate(article.createdAt)}</span>
                  </div>
                </div>
                <Link href={`/admin/articles/${article.id}/edit`} className="btn btn-ghost btn-sm">
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Pengguna Baru</h2>
            <Link href="/admin/users" className="btn btn-ghost btn-sm">Lihat semua</Link>
          </div>
          <div className={styles.dataCard}>
            {recentUsers.map((user) => (
              <div key={user.id} className={styles.dataRow}>
                <div className={styles.userAvatar}>{user.name.charAt(0).toUpperCase()}</div>
                <div className={styles.dataRowContent}>
                  <p className={styles.dataTitle}>{user.name}</p>
                  <p className={styles.dataEmail}>{user.email}</p>
                </div>
                <span className={`badge ${user.role === "ADMIN" ? "badge-warning" : "badge-default"}`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
