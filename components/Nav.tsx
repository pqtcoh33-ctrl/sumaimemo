"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();
  const item = (href: string, label: string) => (
    <Link
      href={href}
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        textDecoration: "none",
        background: path === href ? "#111827" : "#f3f4f6",
        color: path === href ? "#fff" : "#111",
        fontWeight: 700,
      }}
    >
      {label}
    </Link>
  );

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {item("/", "結果")}
      {item("/settings", "設定")}
    </div>
  );
}
