"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Search, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import styles from "./page.module.css";

interface Article {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  views: number;
  readTime: number;
  createdAt: string;
  category?: { name: string };
  author: { name: string };
  _count: { comments: number };
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    const res = await fetch("/api/articles?published=all&limit=100");
    if (res.ok) {
      const data = await res.json();
      setArticles(data.articles || []);
    }
    setIsLoading(false);
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    const res = await fetch(`/api/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !currentStatus }),
    });

    if (res.ok) {
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, published: !a.published } : a))
      );
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("Yakin ingin menghapus artikel ini?")) return;
    setDeletingId(id);

    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (res.ok) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
    }
    setDeletingId(null);
  };

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && a.published) ||
      (filterStatus === "draft" && !a.published);
    return matchSearch && matchStatus;
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Manajemen Artikel</h1>
          <p className={styles.pageSubtitle}>{articles.length} artikel tersimpan</p>
        </div>
        <Link href="/admin/articles/new" className="btn btn-primary">
          <Plus size={16} />
          Tulis Artikel
        </Link>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            className="input"
            placeholder="Cari artikel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "36px" }}
          />
        </div>
        <div className={styles.filterTabs}>
          {(["all", "published", "draft"] as const).map((s) => (
            <button
              key={s}
              className={`${styles.filterTab} ${filterStatus === s ? styles.activeTab : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === "all" ? "Semua" : s === "published" ? "Publik" : "Draft"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className={styles.loadingState}>
          <Loader2 size={24} className={styles.spinner} />
          <span>Memuat artikel...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={48} />
          <p>Tidak ada artikel ditemukan.</p>
          <Link href="/admin/articles/new" className="btn btn-primary">Buat Artikel Pertama</Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Judul</th>
                <th>Kategori</th>
                <th>Status</th>
                <th>Views</th>
                <th>Komentar</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((article) => (
                <tr key={article.id}>
                  <td>
                    <p className={styles.articleTitle}>{article.title}</p>
                    <p className={styles.articleSlug}>{article.slug}</p>
                  </td>
                  <td>
                    {article.category ? (
                      <span className="badge badge-default">{article.category.name}</span>
                    ) : (
                      <span className={styles.noCategory}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${article.published ? "badge-success" : "badge-warning"}`}>
                      {article.published ? "Publik" : "Draft"}
                    </span>
                  </td>
                  <td className={styles.numCell}>{article.views}</td>
                  <td className={styles.numCell}>{article._count.comments}</td>
                  <td className={styles.dateCell}>{formatDate(article.createdAt)}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className="btn btn-ghost btn-icon"
                        title={article.published ? "Jadikan Draft" : "Publikasikan"}
                        onClick={() => togglePublish(article.id, article.published)}
                      >
                        {article.published ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <Link href={`/admin/articles/${article.id}/edit`} className="btn btn-ghost btn-icon">
                        <Edit size={15} />
                      </Link>
                      <button
                        className="btn btn-danger btn-icon"
                        onClick={() => deleteArticle(article.id)}
                        disabled={deletingId === article.id}
                      >
                        {deletingId === article.id ? (
                          <Loader2 size={15} className={styles.spinner} />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
