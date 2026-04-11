"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import styles from "./MarkCompleteButton.module.css";

interface Props {
  articleId: string;
  isCompleted: boolean;
}

export default function MarkCompleteButton({ articleId, isCompleted }: Props) {
  const [completed, setCompleted] = useState(isCompleted);
  const [isLoading, setIsLoading] = useState(false);

  const handleMark = async () => {
    setIsLoading(true);
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, completed: !completed }),
    });

    if (res.ok) setCompleted(!completed);
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleMark}
      disabled={isLoading}
      className={`${styles.btn} ${completed ? styles.completed : ""}`}
    >
      {isLoading ? (
        <Loader2 size={16} className={styles.spinner} />
      ) : (
        <CheckCircle size={16} />
      )}
      {completed ? "Sudah Selesai Dibaca ✓" : "Tandai Selesai Dibaca"}
    </button>
  );
}
