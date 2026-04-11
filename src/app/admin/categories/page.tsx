"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, FolderOpen, Tag } from "lucide-react";
import styles from "./page.module.css";

interface Category { id: string; name: string; slug: string; description?: string; _count: { articles: number } }
interface TagItem { id: string; name: string; slug: string; _count: { articles: number } }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [savingCat, setSavingCat] = useState(false);
  const [savingTag, setSavingTag] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [cats, tgs] = await Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/tags").then((r) => r.json()),
    ]);
    setCategories(cats);
    setTags(tgs);
    setIsLoading(false);
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSavingCat(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName, description: newCatDesc }),
    });
    if (res.ok) { setNewCatName(""); setNewCatDesc(""); await fetchData(); }
    setSavingCat(false);
  };

  const addTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setSavingTag(true);
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTagName }),
    });
    if (res.ok) { setNewTagName(""); await fetchData(); }
    setSavingTag(false);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Hapus kategori ini?")) return;
    setDeletingId(id);
    await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    setCategories((p) => p.filter((c) => c.id !== id));
    setDeletingId(null);
  };

  const deleteTag = async (id: string) => {
    if (!confirm("Hapus tag ini?")) return;
    setDeletingId(id);
    await fetch(`/api/tags?id=${id}`, { method: "DELETE" });
    setTags((p) => p.filter((t) => t.id !== id));
    setDeletingId(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Kategori & Tag</h1>
        <p className={styles.pageSubtitle}>Kelola pengorganisasian konten</p>
      </div>

      <div className={styles.grid}>
        {/* Categories */}
        <div>
          <h2 className={styles.sectionTitle}><FolderOpen size={18} /> Kategori ({categories.length})</h2>

          <form onSubmit={addCategory} className={styles.addForm}>
            <input className="input" placeholder="Nama kategori..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} required />
            <input className="input" placeholder="Deskripsi (opsional)" value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} />
            <button type="submit" className="btn btn-primary" disabled={savingCat}>
              {savingCat ? <Loader2 size={14} className={styles.spinner} /> : <Plus size={14} />} Tambah
            </button>
          </form>

          {isLoading ? (
            <div className={styles.loadingState}><Loader2 size={20} className={styles.spinner} /></div>
          ) : (
            <div className={styles.list}>
              {categories.map((cat) => (
                <div key={cat.id} className={styles.listItem}>
                  <div>
                    <p className={styles.listItemName}>{cat.name}</p>
                    <p className={styles.listItemMeta}>{cat._count.articles} artikel · /{cat.slug}</p>
                  </div>
                  <button className="btn btn-danger btn-icon" onClick={() => deleteCategory(cat.id)} disabled={deletingId === cat.id}>
                    {deletingId === cat.id ? <Loader2 size={14} className={styles.spinner} /> : <Trash2 size={14} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <h2 className={styles.sectionTitle}><Tag size={18} /> Tag ({tags.length})</h2>

          <form onSubmit={addTag} className={styles.addForm}>
            <input className="input" placeholder="Nama tag..." value={newTagName} onChange={(e) => setNewTagName(e.target.value)} required />
            <button type="submit" className="btn btn-primary" disabled={savingTag}>
              {savingTag ? <Loader2 size={14} className={styles.spinner} /> : <Plus size={14} />} Tambah
            </button>
          </form>

          {isLoading ? (
            <div className={styles.loadingState}><Loader2 size={20} className={styles.spinner} /></div>
          ) : (
            <div className={styles.tagGrid}>
              {tags.map((tag) => (
                <div key={tag.id} className={styles.tagItem}>
                  <span className={styles.tagName}>{tag.name}</span>
                  <span className={styles.tagCount}>{tag._count.articles}</span>
                  <button className={styles.tagDelete} onClick={() => deleteTag(tag.id)} disabled={deletingId === tag.id}>
                    {deletingId === tag.id ? <Loader2 size={11} className={styles.spinner} /> : <Trash2 size={11} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
