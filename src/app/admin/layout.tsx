import Link from "next/link";
import React from "react";
import { checkAuth } from "../actions";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    redirect("/login");
  }

  // Enforce dark mode for admin
  return (
    <div data-theme="dark" style={{ 
      minHeight: '100vh', 
      display: 'flex',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-primary)'
    }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: 'var(--bg-card)', 
        borderRight: '1px solid var(--border-color)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>Admin Panel</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>caridisni</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
          <Link href="/admin" style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: 'rgba(238, 77, 45, 0.1)', color: 'var(--primary)', fontWeight: '600' }}>
            Produk
          </Link>
          <Link href="/" style={{ padding: '12px 16px', borderRadius: '8px', color: 'var(--text-secondary)', marginTop: 'auto' }}>
            &larr; Kembali ke Web
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
