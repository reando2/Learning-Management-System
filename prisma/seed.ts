import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
dotenv.config();

const db = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

async function main() {
  console.log("🌱 Seeding database...");

  // Create Admin user
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
  console.log("✅ Admin user:", admin.email);

  // Create Student user
  const studentPassword = await bcrypt.hash("student123", 12);
  const student = await db.user.upsert({
    where: { email: "student@learninghub.id" },
    update: {},
    create: {
      name: "Budi Santoso",
      email: "student@learninghub.id",
      password: studentPassword,
      role: "STUDENT",
    },
  });
  console.log("✅ Student user:", student.email);

  // Create Categories
  const categories = await Promise.all([
    db.category.upsert({ where: { slug: "pemrograman" }, update: {}, create: { name: "Pemrograman", slug: "pemrograman", description: "Tutorial dan panduan pemrograman" } }),
    db.category.upsert({ where: { slug: "web-development" }, update: {}, create: { name: "Web Development", slug: "web-development", description: "Pengembangan website modern" } }),
    db.category.upsert({ where: { slug: "database" }, update: {}, create: { name: "Database", slug: "database", description: "Manajemen dan desain database" } }),
  ]);
  console.log("✅ Categories created");

  // Create Tags
  const tags = await Promise.all([
    db.tag.upsert({ where: { slug: "javascript" }, update: {}, create: { name: "JavaScript", slug: "javascript" } }),
    db.tag.upsert({ where: { slug: "typescript" }, update: {}, create: { name: "TypeScript", slug: "typescript" } }),
    db.tag.upsert({ where: { slug: "nextjs" }, update: {}, create: { name: "Next.js", slug: "nextjs" } }),
    db.tag.upsert({ where: { slug: "react" }, update: {}, create: { name: "React", slug: "react" } }),
    db.tag.upsert({ where: { slug: "pemula" }, update: {}, create: { name: "Pemula", slug: "pemula" } }),
  ]);
  console.log("✅ Tags created");

  // Create Sample Articles
  const articles = [
    {
      title: "Panduan Lengkap Memulai Next.js 15",
      slug: "panduan-lengkap-memulai-nextjs-15",
      excerpt: "Pelajari cara membuat aplikasi web modern dengan Next.js 15 menggunakan App Router, Server Components, dan fitur terbaru lainnya.",
      content: `<h2>Apa itu Next.js?</h2><p>Next.js adalah framework React yang memungkinkan Anda membangun aplikasi web yang cepat dan SEO-friendly. Dengan Next.js 15, Anda mendapatkan fitur-fitur canggih seperti App Router, Server Components, dan Server Actions.</p><h2>Mengapa Memilih Next.js?</h2><p>Next.js menawarkan berbagai keunggulan dibanding solusi lainnya:</p><ul><li>Rendering sisi server (SSR) untuk SEO yang lebih baik</li><li>Static Site Generation (SSG) untuk performa optimal</li><li>App Router yang intuitif dan powerful</li><li>Hot Module Replacement untuk pengalaman developer yang menyenangkan</li></ul><h2>Mulai Proyek Pertama</h2><p>Untuk memulai proyek Next.js baru, jalankan perintah berikut di terminal:</p><pre><code>npx create-next-app@latest my-app --typescript --tailwind --app</code></pre><p>Perintah di atas akan membuat proyek baru dengan TypeScript, Tailwind CSS, dan App Router yang sudah dikonfigurasi.</p><h2>Struktur Folder</h2><p>Next.js menggunakan konvensi berbasis file untuk routing. Setiap file di dalam folder <code>app/</code> secara otomatis menjadi route yang dapat diakses.</p>`,
      published: true,
      readTime: 8,
      authorId: admin.id,
      categoryId: categories[1].id,
    },
    {
      title: "Memahami TypeScript: Dari Dasar hingga Mahir",
      slug: "memahami-typescript-dari-dasar-hingga-mahir",
      excerpt: "TypeScript menambahkan sistem tipe yang kuat ke JavaScript. Pelajari cara menggunakannya untuk menulis kode yang lebih aman dan mudah di-maintain.",
      content: `<h2>Mengapa TypeScript?</h2><p>TypeScript adalah superset dari JavaScript yang menambahkan pengetikan statis opsional. Ini membantu mendeteksi bug sebelum runtime dan membuat kode lebih mudah dibaca dan di-maintain.</p><h2>Tipe Dasar</h2><p>TypeScript menyediakan beberapa tipe dasar yang sering digunakan:</p><ul><li><code>string</code> - untuk teks</li><li><code>number</code> - untuk angka</li><li><code>boolean</code> - untuk nilai true/false</li><li><code>array</code> - untuk koleksi data</li><li><code>object</code> - untuk objek</li></ul><h2>Interface dan Type Alias</h2><p>Anda bisa mendefinisikan bentuk objek menggunakan interface atau type alias:</p><pre><code>interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
}</code></pre><p>TypeScript akan memastikan bahwa setiap objek yang menggunakan interface ini memiliki properti yang benar dengan tipe yang tepat.</p>`,
      published: true,
      readTime: 12,
      authorId: admin.id,
      categoryId: categories[0].id,
    },
    {
      title: "Prisma ORM: Cara Mudah Bekerja dengan Database",
      slug: "prisma-orm-cara-mudah-bekerja-dengan-database",
      excerpt: "Prisma adalah ORM modern untuk Node.js dan TypeScript yang membuat bekerja dengan database menjadi lebih mudah dan type-safe.",
      content: `<h2>Apa itu Prisma?</h2><p>Prisma adalah Object-Relational Mapper (ORM) generasi berikutnya untuk Node.js dan TypeScript. Ia menyediakan API yang intuitif dan type-safe untuk berinteraksi dengan database.</p><h2>Mendukung Berbagai Database</h2><p>Prisma mendukung berbagai database populer:</p><ul><li>PostgreSQL</li><li>MySQL</li><li>SQLite</li><li>SQL Server</li><li>MongoDB</li></ul><h2>Mendefinisikan Schema</h2><p>Schema Prisma adalah file tunggal yang mendefinisikan model data Anda dan hubungannya:</p><pre><code>model User {
  id    String @id @default(cuid())
  name  String
  email String @unique
  posts Post[]
}</code></pre><p>Prisma kemudian menghasilkan client yang fully-typed berdasarkan schema Anda.</p>`,
      published: true,
      readTime: 10,
      authorId: admin.id,
      categoryId: categories[2].id,
    },
  ];

  for (const article of articles) {
    await db.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        ...article,
        tags: {
          create: [
            { tagId: tags[2].id }, // nextjs
            { tagId: tags[0].id }, // javascript
          ],
        },
      },
    });
  }
  console.log("✅ Sample articles created");

  console.log("\n🎉 Seeding selesai!");
  console.log("\n📋 Akun untuk login:");
  console.log("   Admin  → admin@learninghub.id / admin123");
  console.log("   Student → student@learninghub.id / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
