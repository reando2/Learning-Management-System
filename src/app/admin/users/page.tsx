"use client";

import { useState, useEffect } from "react";
import { Users, Search, Shield, UserX, UserCheck, Trash2, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import styles from "./page.module.css";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STUDENT";
  isActive: boolean;
  createdAt: string;
  _count: { progresses: number; comments: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
    setIsLoading(false);
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    setLoadingId(id);
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
    }
    setLoadingId(null);
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Yakin ingin menghapus pengguna ini? Semua data akan terhapus.")) return;
    setLoadingId(id);
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id));
    setLoadingId(null);
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Manajemen Pengguna</h1>
          <p className={styles.pageSubtitle}>{users.length} pengguna terdaftar</p>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchWrapper}>
        <Search size={15} className={styles.searchIcon} />
        <input
          type="text"
          className="input"
          placeholder="Cari nama atau email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: "36px" }}
        />
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>
          <Loader2 size={24} className={styles.spinner} />
          <span>Memuat data pengguna...</span>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Role</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Komentar</th>
                <th>Daftar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className={styles.userName}>{user.name}</p>
                        <p className={styles.userEmail}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${user.role === "ADMIN" ? "badge-warning" : "badge-default"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.isActive ? "badge-success" : "badge-error"}`}>
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className={styles.numCell}>{user._count.progresses}</td>
                  <td className={styles.numCell}>{user._count.comments}</td>
                  <td className={styles.dateCell}>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className={styles.actions}>
                      {/* Toggle Role */}
                      <button
                        className="btn btn-ghost btn-icon"
                        title={user.role === "ADMIN" ? "Jadikan Student" : "Jadikan Admin"}
                        onClick={() => updateUser(user.id, { role: user.role === "ADMIN" ? "STUDENT" : "ADMIN" })}
                        disabled={loadingId === user.id}
                      >
                        {loadingId === user.id ? <Loader2 size={14} className={styles.spinner} /> : <Shield size={15} />}
                      </button>

                      {/* Toggle Active */}
                      <button
                        className="btn btn-ghost btn-icon"
                        title={user.isActive ? "Nonaktifkan" : "Aktifkan"}
                        onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                        disabled={loadingId === user.id}
                      >
                        {user.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>

                      {/* Delete */}
                      <button
                        className="btn btn-danger btn-icon"
                        onClick={() => deleteUser(user.id)}
                        disabled={loadingId === user.id}
                      >
                        <Trash2 size={15} />
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
