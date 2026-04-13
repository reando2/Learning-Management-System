"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BookOpen,
  LayoutDashboard,
  FileText,
  Users,
  Tag,
  MessageSquare,
  LogOut,
  Shield,
  FolderOpen,
  Globe,
} from "lucide-react";
import styles from "./AdminSidebar.module.css";

interface Props {
  user: { name: string; email: string; role: string };
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Artikel", icon: FileText },
  { href: "/admin/articles/new", label: "Tambah Artikel", icon: FileText },
  { href: "/admin/categories", label: "Kategori & Tag", icon: FolderOpen },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/comments", label: "Komentar", icon: MessageSquare },
];

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.header}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}><BookOpen size={16} /></div>
          <span className={styles.logoText}>Learnhub</span>
        </Link>
        <span className={styles.adminBadge}>
          <Shield size={10} /> ADMIN
        </span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <p className={styles.navSection}>Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive(item.href) ? styles.active : ""}`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}

        <div className={styles.divider} />

        <p className={styles.navSection}>Site</p>
        <Link href="/" className={`${styles.navItem}`} target="_blank">
          <Globe size={16} />
          Lihat Website
        </Link>
      </nav>

      {/* User Footer */}
      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{user.name}</p>
            <p className={styles.userEmail}>{user.email}</p>
          </div>
        </div>
        <button
          className={styles.logoutBtn}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut size={15} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
