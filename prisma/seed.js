// @ts-nocheck
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const path = require("path");

// Load env
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@learninghub.id" },
    update: {},
    create: {
      name: "Admin LearningHub",
      email: "admin@learninghub.id",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin:", admin.email);

  // Student user
  const studentPwd = await bcrypt.hash("student123", 12);
  await db.user.upsert({
    where: { email: "student@learninghub.id" },
    update: {},
    create: {
      name: "Budi Santoso",
      email: "student@learninghub.id",
      password: studentPwd,
      role: "STUDENT",
    },
  });
  console.log("✅ Student: student@learninghub.id");

  // Categories
  const catPemrograman = await db.category.upsert({
    where: { slug: "pemrograman" },
    update: {},
    create: { name: "Pemrograman", slug: "pemrograman", description: "Tutorial pemrograman" },
  });
  const catWeb = await db.category.upsert({
    where: { slug: "web-development" },
    update: {},
    create: { name: "Web Development", slug: "web-development", description: "Pengembangan website" },
  });
  const catDb = await db.category.upsert({
    where: { slug: "database" },
    update: {},
    create: { name: "Database", slug: "database", description: "Manajemen database" },
  });
  console.log("✅ Categories created");

  // Tags
  const tagJs = await db.tag.upsert({ where: { slug: "javascript" }, update: {}, create: { name: "JavaScript", slug: "javascript" } });
  const tagTs = await db.tag.upsert({ where: { slug: "typescript" }, update: {}, create: { name: "TypeScript", slug: "typescript" } });
  const tagNext = await db.tag.upsert({ where: { slug: "nextjs" }, update: {}, create: { name: "Next.js", slug: "nextjs" } });
  const tagReact = await db.tag.upsert({ where: { slug: "react" }, update: {}, create: { name: "React", slug: "react" } });
  const tagPemula = await db.tag.upsert({ where: { slug: "pemula" }, update: {}, create: { name: "Pemula", slug: "pemula" } });
  console.log("✅ Tags created");

  // Articles
  const articles = [
    {
      title: "Panduan Lengkap Memulai Next.js 15",
      slug: "panduan-lengkap-memulai-nextjs-15",
      excerpt: "Pelajari cara membuat aplikasi web modern dengan Next.js 15 menggunakan App Router.",
      content: "<h2>Apa itu Next.js?</h2><p>Next.js adalah framework React yang memungkinkan Anda membangun aplikasi web yang cepat dan SEO-friendly. Dengan Next.js 15, Anda mendapatkan fitur-fitur canggih seperti App Router, Server Components, dan Server Actions.</p><h2>Mengapa Memilih Next.js?</h2><p>Next.js menawarkan berbagai keunggulan dibanding solusi lainnya:</p><ul><li>Rendering sisi server (SSR) untuk SEO yang lebih baik</li><li>Static Site Generation (SSG) untuk performa optimal</li><li>App Router yang intuitif dan powerful</li><li>Hot Module Replacement untuk developer experience yang menyenangkan</li></ul><h2>Mulai Proyek Pertama</h2><p>Untuk memulai proyek Next.js baru, jalankan perintah berikut di terminal Anda.</p><p>Next.js akan secara otomatis mengkonfigurasi TypeScript, Tailwind CSS, dan berbagai tooling yang diperlukan untuk pengembangan modern.</p>",
      published: true,
      readTime: 8,
      authorId: admin.id,
      categoryId: catWeb.id,
      tagIds: [tagNext.id, tagJs.id, tagPemula.id],
    },
    {
      title: "Memahami TypeScript: Dari Dasar hingga Mahir",
      slug: "memahami-typescript-dari-dasar-hingga-mahir",
      excerpt: "TypeScript menambahkan sistem tipe yang kuat ke JavaScript untuk kode yang lebih aman.",
      content: "<h2>Mengapa TypeScript?</h2><p>TypeScript adalah superset dari JavaScript yang menambahkan pengetikan statis opsional. Ini membantu mendeteksi bug sebelum runtime dan membuat kode lebih mudah dibaca dan di-maintain.</p><h2>Tipe Dasar</h2><p>TypeScript menyediakan beberapa tipe dasar yang sering digunakan dalam pengembangan aplikasi modern:</p><ul><li><code>string</code> - untuk teks</li><li><code>number</code> - untuk angka</li><li><code>boolean</code> - untuk nilai true/false</li><li><code>Array</code> - untuk koleksi data</li></ul><h2>Interface</h2><p>Interface memungkinkan Anda mendefinisikan bentuk objek dengan cara yang type-safe dan mudah di-reuse di seluruh codebase Anda.</p>",
      published: true,
      readTime: 12,
      authorId: admin.id,
      categoryId: catPemrograman.id,
      tagIds: [tagTs.id, tagJs.id],
    },
    {
      title: "Prisma ORM: Cara Mudah Bekerja dengan Database",
      slug: "prisma-orm-cara-mudah-bekerja-dengan-database",
      excerpt: "Prisma adalah ORM modern untuk Node.js dan TypeScript yang membuat bekerja dengan database mudah.",
      content: "<h2>Apa itu Prisma?</h2><p>Prisma adalah Object-Relational Mapper (ORM) generasi berikutnya untuk Node.js dan TypeScript. Ia menyediakan API yang intuitif dan type-safe untuk berinteraksi dengan database Anda.</p><h2>Mendukung Berbagai Database</h2><p>Prisma mendukung berbagai database populer termasuk PostgreSQL, MySQL, SQLite, SQL Server, dan MongoDB.</p><h2>Schema Prisma</h2><p>Schema Prisma adalah file tunggal yang mendefinisikan model data Anda dan hubungan antar model tersebut. Prisma kemudian menghasilkan client yang fully-typed berdasarkan schema Anda.</p>",
      published: true,
      readTime: 10,
      authorId: admin.id,
      categoryId: catDb.id,
      tagIds: [tagTs.id, tagPemula.id],
    },
  ];

  for (const { tagIds, ...article } of articles) {
    const existing = await db.article.findUnique({ where: { slug: article.slug } });
    if (!existing) {
      await db.article.create({
        data: {
          ...article,
          tags: { create: tagIds.map((tagId) => ({ tagId })) },
        },
      });
    }
  }
  console.log("✅ Sample articles created");

  console.log("\n🎉 Seeding selesai!");
  console.log("\n📋 Akun untuk login:");
  console.log("   Admin   → admin@learninghub.id / admin123");
  console.log("   Student → student@learninghub.id / student123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
