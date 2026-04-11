"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import {
  Bold, Italic, List, ListOrdered, Quote, Code,
  Minus, Heading1, Heading2, Heading3, Loader2, Save, Eye,
  ImagePlus, Link, Upload, X
} from "lucide-react";
import styles from "./page.module.css";

interface Category { id: string; name: string }
interface Tag { id: string; name: string }

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [readTime, setReadTime] = useState(5);
  const [published, setPublished] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Mulai tulis konten artikel di sini..." }),
      Image.configure({ HTMLAttributes: { class: "editor-image" } }),
    ],
    editorProps: { attributes: { class: "tiptap-editor-content" } },
  });

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setUploadError(data.error || "Gagal mengunggah gambar"); return; }
      editor?.chain().focus().setImage({ src: data.url }).run();
      setShowImageModal(false);
      setImageUrl("");
    } catch {
      setUploadError("Terjadi kesalahan saat mengunggah");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInsertImageUrl = () => {
    if (!imageUrl.trim()) { setUploadError("Masukkan URL gambar"); return; }
    editor?.chain().focus().setImage({ src: imageUrl.trim() }).run();
    setShowImageModal(false);
    setImageUrl("");
    setUploadError("");
  };

  const openImageModal = () => {
    setImageUrl("");
    setUploadError("");
    setShowImageModal(true);
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/tags").then((r) => r.json()),
    ]).then(([cats, tgs]) => {
      setCategories(cats);
      setTags(tgs);
    });
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = async (publish = false) => {
    if (!title.trim()) { setError("Judul artikel wajib diisi"); return; }
    if (!editor?.getText().trim()) { setError("Konten artikel wajib diisi"); return; }

    setError("");
    setIsSaving(true);

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: editor?.getHTML() || "",
          excerpt: excerpt || undefined,
          categoryId: categoryId || undefined,
          tagIds: selectedTagIds,
          readTime,
          published: publish,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal menyimpan artikel"); return; }

      router.push("/admin/articles");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!editor) return null;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Tulis Artikel Baru</h1>
          <p className={styles.pageSubtitle}>Buat konten pembelajaran berkualitas</p>
        </div>
        <div className={styles.headerActions}>
          <button
            className="btn btn-secondary"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 size={15} className={styles.spinner} /> : <Save size={15} />}
            Simpan Draft
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 size={15} className={styles.spinner} /> : <Eye size={15} />}
            Publikasikan
          </button>
        </div>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.editorLayout}>
        {/* Main Editor */}
        <div className={styles.editorMain}>
          <div className="form-group">
            <label className="label">Judul Artikel</label>
            <input
              type="text"
              className={styles.titleInput}
              placeholder="Masukkan judul artikel yang menarik..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="label">Ringkasan (Excerpt)</label>
            <textarea
              className="input"
              placeholder="Ringkasan singkat artikel (opsional)..."
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Toolbar */}
          <div className="form-group">
            <label className="label">Konten Artikel</label>
            <div className="tiptap-editor">
              <div className={styles.toolbar}>
                <button type="button" className={`${styles.toolBtn} ${editor.isActive("bold") ? styles.active : ""}`} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold size={14} /></button>
                <button type="button" className={`${styles.toolBtn} ${editor.isActive("italic") ? styles.active : ""}`} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic size={14} /></button>
                <div className={styles.toolDivider} />
                <button type="button" className={`${styles.toolBtn} ${editor.isActive("heading", { level: 1 }) ? styles.active : ""}`} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="H1"><Heading1 size={14} /></button>
                <button type="button" className={`${styles.toolBtn} ${editor.isActive("heading", { level: 2 }) ? styles.active : ""}`} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="H2"><Heading2 size={14} /></button>
                <button type="button" className={`${styles.toolBtn} ${editor.isActive("heading", { level: 3 }) ? styles.active : ""}`} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="H3"><Heading3 size={14} /></button>
                <div className={styles.toolDivider} />
                <button type="button" className={`${styles.toolBtn} ${editor.isActive("bulletList") ? styles.active : ""}`} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List"><List size={14} /></button>
                <button type="button" className={`${styles.toolBtn} ${editor.isActive("orderedList") ? styles.active : ""}`} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List"><ListOrdered size={14} /></button>
                <button type="button" className={`${styles.toolBtn} ${editor.isActive("blockquote") ? styles.active : ""}`} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote"><Quote size={14} /></button>
                <button type="button" className={`${styles.toolBtn} ${editor.isActive("code") ? styles.active : ""}`} onClick={() => editor.chain().focus().toggleCode().run()} title="Code"><Code size={14} /></button>
                <button type="button" className={styles.toolBtn} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus size={14} /></button>
                <div className={styles.toolDivider} />
                <button type="button" className={styles.toolBtn} onClick={openImageModal} title="Sisipkan Gambar"><ImagePlus size={14} /></button>
              </div>
              <EditorContent editor={editor} />

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.editorSidebar}>
          {/* Publish Toggle */}
          <div className={styles.sideCard}>
            <p className={styles.sideCardTitle}>Status</p>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              <span className={styles.toggleTrack}>
                <span className={styles.toggleThumb} />
              </span>
              <span className={styles.toggleLabel}>{published ? "Publik" : "Draft"}</span>
            </label>
          </div>

          {/* Category */}
          <div className={styles.sideCard}>
            <p className={styles.sideCardTitle}>Kategori</p>
            <select
              className="input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Pilih kategori...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className={styles.sideCard}>
            <p className={styles.sideCardTitle}>Tag</p>
            <div className={styles.tagGrid}>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag ${selectedTagIds.includes(tag.id) ? "active" : ""}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 && (
                <p className={styles.sideEmpty}>Belum ada tag. Tambahkan di halaman Kategori & Tag.</p>
              )}
            </div>
          </div>

          {/* Read Time */}
          <div className={styles.sideCard}>
            <p className={styles.sideCardTitle}>Estimasi Baca</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="number"
                className="input"
                value={readTime}
                onChange={(e) => setReadTime(Number(e.target.value))}
                min={1}
                max={120}
              />
              <span style={{ color: "var(--text-muted)", fontSize: "14px", flexShrink: 0 }}>menit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className={styles.modalOverlay} onClick={() => setShowImageModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Sisipkan Gambar</h3>
              <button className={styles.modalClose} onClick={() => setShowImageModal(false)}>
                <X size={18} />
              </button>
            </div>

            {uploadError && (
              <div className={styles.uploadError}>{uploadError}</div>
            )}

            {/* Upload file */}
            <div className={styles.uploadZone} onClick={() => fileInputRef.current?.click()}>
              {isUploading ? (
                <div className={styles.uploadingState}>
                  <Loader2 size={28} className={styles.spinner} />
                  <p>Mengunggah gambar...</p>
                </div>
              ) : (
                <>
                  <Upload size={28} className={styles.uploadIcon} />
                  <p className={styles.uploadTitle}>Klik untuk unggah gambar</p>
                  <p className={styles.uploadHint}>JPG, PNG, GIF, WebP, SVG — Maks. 5MB</p>
                </>
              )}
            </div>

            <div className={styles.modalDivider}>
              <span>atau masukkan URL</span>
            </div>

            {/* URL input */}
            <div className={styles.urlRow}>
              <div className={styles.urlInputWrapper}>
                <Link size={16} className={styles.urlIcon} />
                <input
                  type="url"
                  className={styles.urlInput}
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInsertImageUrl()}
                />
              </div>
              <button className="btn btn-primary" onClick={handleInsertImageUrl}>
                Sisipkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
