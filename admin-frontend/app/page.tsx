import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Admin frontend</h1>
      <p>
        Đi tới <Link href="/admin">/admin</Link>
      </p>
    </div>
  );
}
