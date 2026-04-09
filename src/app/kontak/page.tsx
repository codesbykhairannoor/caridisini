import Header from "@/components/Header";
import { Mail, MessageCircle, Instagram, Github } from "lucide-react";

export default function KontakPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', background: 'var(--bg-color)', padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '16px' }}>Kontak Kami</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Punya pertanyaan atau ingin bekerjasama? Kami siap membantu Anda.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <a href="mailto:contact@caridisni.com" className="card" style={{ padding: '24px', textAlign: 'center', transition: 'all 0.2s' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}><Mail size={28} /></div>
              <h4 style={{ fontWeight: '700' }}>Email</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>contact@caridisni.com</p>
            </a>
            <a href="#" className="card" style={{ padding: '24px', textAlign: 'center', transition: 'all 0.2s' }}>
              <div style={{ color: '#25D366', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}><MessageCircle size={28} /></div>
              <h4 style={{ fontWeight: '700' }}>WhatsApp</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Chat Fast Response</p>
            </a>
            <a href="#" className="card" style={{ padding: '24px', textAlign: 'center', transition: 'all 0.2s' }}>
              <div style={{ color: '#E4405F', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}><Instagram size={28} /></div>
              <h4 style={{ fontWeight: '700' }}>Instagram</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>@caridisni.official</p>
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
