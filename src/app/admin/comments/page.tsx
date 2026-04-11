"use client";
import { useState, useEffect } from "react";
import { Check, X, Trash2, Loader2, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import styles from "./page.module.css";

interface Comment {
  id: string;
  content: string;
  approved: boolean;
  createdAt: string;
  author: { name: string; email: string };
  article: { title: string; slug: string };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => { fetchComments(); }, [filter]);

  const fetchComments = async () => {
    setIsLoading(true);
    const q = filter === "all" ? "" : filter === "pending" ? "?approved=false" : "?approved=true";
    const res = await fetch(`/api/comments${q}`);
    if (res.ok) setComments(await res.json());
    setIsLoading(false);
  };

  const approveComment = async (id: string, approved: boolean) => {
    setLoadingId(id);
    const res = await fetch(`/api/comments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    if (res.ok) setComments((prev) => prev.map((c) => (c.id === id ? { ...c, approved } : c)));
    setLoadingId(null);
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Hapus komentar ini?")) return;
    setLoadingId(id);
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (res.ok) setComments((prev) => prev.filter((c) => c.id !== id));
    setLoadingId(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Moderasi Komentar</h1>
          <p className={styles.pageSubtitle}>{comments.length} komentar</p>
        </div>
      </div>

      <div className={styles.filterTabs}>
        {(["pending", "all", "approved"] as const).map((f) => (
          <button
            key={f}
            className={`${styles.filterTab} ${filter === f ? styles.active : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "pending" ? "Menunggu" : f === "all" ? "Semua" : "Disetujui"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className={styles.loadingState}><Loader2 size={24} className={styles.spinner} /><span>Memuat...</span></div>
      ) : comments.length === 0 ? (
        <div className={styles.emptyState}><MessageSquare size={48} /><p>Tidak ada komentar.</p></div>
      ) : (
        <div className={styles.commentList}>
          {comments.map((c) => (
            <div key={c.id} className={styles.commentCard}>
              <div className={styles.commentHeader}>
                <div>
                  <p className={styles.commentAuthor}>{c.author.name} <span className={styles.commentEmail}>({c.author.email})</span></p>
                  <p className={styles.commentMeta}>
                    pada <Link href={`/articles/${c.article.slug}`} className={styles.articleLink} target="_blank">{c.article.title}</Link>
                    {" "}· {formatDate(c.createdAt)}
                  </p>
                </div>
                <span className={`badge ${c.approved ? "badge-success" : "badge-warning"}`}>
                  {c.approved ? "Disetujui" : "Menunggu"}
                </span>
              </div>
              <p className={styles.commentContent}>{c.content}</p>
              <div className={styles.commentActions}>
                {!c.approved ? (
                  <button className="btn btn-secondary btn-sm" onClick={() => approveComment(c.id, true)} disabled={loadingId === c.id}>
                    {loadingId === c.id ? <Loader2 size={14} className={styles.spinner} /> : <Check size={14} />}
                    Setujui
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={() => approveComment(c.id, false)} disabled={loadingId === c.id}>
                    <X size={14} /> Batalkan
                  </button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => deleteComment(c.id)} disabled={loadingId === c.id}>
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
