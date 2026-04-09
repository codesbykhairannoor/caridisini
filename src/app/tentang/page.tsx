import Header from "@/components/Header";
import { Info, Terminal, Target, Users } from "lucide-react";

export default function TentangPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', background: 'var(--bg-color)', padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '16px', marginBottom: '24px' }}>
              <Info size={32} />
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '16px' }}>Tentang CariDisni</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Destinasi utama bagi pembaca cerdas yang mencari produk Shopee pilihan dengan harga termurah dan kualitas terjamin.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Target size={24} /></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px' }}>Misi Kami</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Membantu jutaan pembeli menemukan barang impian tanpa harus pusing membandingkan ribuan toko di Shopee.</p>
            </div>
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Users size={24} /></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px' }}>Tim Kami</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Dikelola oleh tim kurator profesional yang berpengalaman dalam industri affiliate dan e-commerce.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
