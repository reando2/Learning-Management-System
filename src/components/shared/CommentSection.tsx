"use client";

import { useState } from "react";
import { MessageSquare, Send, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import styles from "./CommentSection.module.css";

interface Comment {
  id: string;
  content: string;
  createdAt: string | Date;
  author: { name: string };
}

interface Props {
  articleId: string;
  comments: Comment[];
  isLoggedIn: boolean;
}

export default function CommentSection({ articleId, comments: initial, isLoggedIn }: Props) {
  const [comments, setComments] = useState(initial);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsLoading(true);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, articleId }),
    });

    if (res.ok) {
      setContent("");
      setSent(true);
    }
    setIsLoading(false);
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        <MessageSquare size={20} />
        Komentar ({comments.length})
      </h2>

      {/* Comment List */}
      {comments.length === 0 ? (
        <p className={styles.noComments}>Belum ada komentar. Jadilah yang pertama!</p>
      ) : (
        <div className={styles.commentList}>
          {comments.map((c) => (
            <div key={c.id} className={styles.comment}>
              <div className={styles.commentAvatar}>{c.author.name.charAt(0).toUpperCase()}</div>
              <div className={styles.commentBody}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentAuthor}>{c.author.name}</span>
                  <span className={styles.commentDate}>{formatDate(c.createdAt)}</span>
                </div>
                <p className={styles.commentContent}>{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Form */}
      {isLoggedIn ? (
        sent ? (
          <div className={styles.sentMessage}>
            ✓ Komentar Anda berhasil dikirim dan menunggu moderasi.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <textarea
              className="input"
              placeholder="Tulis komentar Anda..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{ resize: "vertical" }}
            />
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? <Loader2 size={15} className={styles.spinner} /> : <Send size={15} />}
              Kirim Komentar
            </button>
          </form>
        )
      ) : (
        <div className={styles.loginPrompt}>
          <Lock size={16} />
          <span>
            <Link href="/login" className={styles.loginLink}>Masuk</Link>{" "}
            untuk meninggalkan komentar.
          </span>
        </div>
      )}
    </section>
  );
}
