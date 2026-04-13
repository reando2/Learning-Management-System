"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  BookOpen,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  Shield,
} from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      <div className="container">
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <BookOpen size={18} />
            </div>
            <span className={styles.logoText}>Learnhub</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className={styles.navLinks}>
            <Link
              href="/"
              className={`${styles.navLink} ${isActive("/") ? styles.active : ""}`}
            >
              Beranda
            </Link>
            <Link
              href="/articles"
              className={`${styles.navLink} ${pathname.startsWith("/articles") ? styles.active : ""}`}
            >
              Artikel
            </Link>
            <Link
              href="/categories"
              className={`${styles.navLink} ${pathname.startsWith("/categories") ? styles.active : ""}`}
            >
              Kategori
            </Link>
          </div>

          {/* Auth Section */}
          <div className={styles.authSection}>
            {session ? (
              <div className={styles.userMenu}>
                <button
                  className={styles.userButton}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className={styles.avatar}>
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className={styles.userName}>
                    {session.user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={isDropdownOpen ? styles.chevronOpen : ""}
                  />
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className={styles.dropdownOverlay}
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownHeader}>
                        <p className={styles.dropdownName}>{session.user?.name}</p>
                        <p className={styles.dropdownEmail}>{session.user?.email}</p>
                        <span
                          className={`badge ${session.user?.role === "ADMIN" ? "badge-warning" : "badge-default"}`}
                          style={{ marginTop: "6px" }}
                        >
                          {session.user?.role}
                        </span>
                      </div>
                      <hr className="divider" style={{ margin: "8px 0" }} />
                      <Link
                        href="/dashboard"
                        className={styles.dropdownItem}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <LayoutDashboard size={15} />
                        Dashboard
                      </Link>
                      {session.user?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className={styles.dropdownItem}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Shield size={15} />
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        href="/dashboard/profile"
                        className={styles.dropdownItem}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User size={15} />
                        Profil
                      </Link>
                      <hr
                        className="divider"
                        style={{ margin: "8px 0" }}
                      />
                      <button
                        className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                        onClick={() => signOut({ callbackUrl: "/" })}
                      >
                        <LogOut size={15} />
                        Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className={styles.authButtons}>
                <Link href="/login" className="btn btn-ghost btn-sm">
                  Masuk
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              className={styles.mobileToggle}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className={styles.mobileMenu}>
          <div className="container">
            <Link href="/" className={styles.mobileLink}>
              Beranda
            </Link>
            <Link href="/articles" className={styles.mobileLink}>
              Artikel
            </Link>
            <Link href="/categories" className={styles.mobileLink}>
              Kategori
            </Link>
            {session ? (
              <>
                <hr className="divider" />
                <Link href="/dashboard" className={styles.mobileLink}>
                  Dashboard
                </Link>
                {session.user?.role === "ADMIN" && (
                  <Link href="/admin" className={styles.mobileLink}>
                    Admin Panel
                  </Link>
                )}
                <button
                  className={`${styles.mobileLink} ${styles.mobileLinkDanger}`}
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <hr className="divider" />
                <Link href="/login" className={styles.mobileLink}>
                  Masuk
                </Link>
                <Link href="/register" className={`${styles.mobileLink} ${styles.mobileLinkPrimary}`}>
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
