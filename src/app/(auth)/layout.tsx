import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary)",
      padding: "24px",
    }}>
      {children}
    </div>
  );
}
