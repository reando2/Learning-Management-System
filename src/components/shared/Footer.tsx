import Link from "next/link";
import { BookOpen, Globe, Send, MessageCircle } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <BookOpen size={18} />
              </div>
              <span className={styles.logoText}>Learnhub</span>
            </Link>
            <p className={styles.tagline}>
              Platform pembelajaran online untuk siswa Teknik Komputer Jaringan SMKN 1 BADEGAN.
            </p>
            <div className={styles.socials}>
              <a href="#" aria-label="Website" className={styles.socialLink}><Globe size={18} /></a>
              <a href="#" aria-label="Email" className={styles.socialLink}><Send size={18} /></a>
              <a href="#" aria-label="Komunitas" className={styles.socialLink}><MessageCircle size={18} /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <p className={styles.colTitle}>Belajar</p>
            <ul className={styles.linkList}>
              <li><Link href="/articles" className={styles.footerLink}>Semua Artikel</Link></li>
              <li><Link href="/categories" className={styles.footerLink}>Kategori</Link></li>
              <li><Link href="/dashboard" className={styles.footerLink}>Progress Saya</Link></li>
            </ul>
          </div>

          <div>
            <p className={styles.colTitle}>Platform</p>
            <ul className={styles.linkList}>
              <li><Link href="/register" className={styles.footerLink}>Daftar Gratis</Link></li>
              <li><Link href="/login" className={styles.footerLink}>Masuk</Link></li>
              <li><Link href="/admin" className={styles.footerLink}>Admin</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Learnhub dibuat oleh Reando
          </p>
        </div>
      </div>
    </footer>
  );
}
