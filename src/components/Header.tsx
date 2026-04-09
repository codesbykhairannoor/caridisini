import Link from 'next/link';
import Image from 'next/image';
import { checkAuth } from '@/app/actions';

export default async function Header() {
  const isAuth = await checkAuth();

  return (
    <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'clamp(60px, 10vw, 72px)' }}>
        <Link href="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', 
          fontWeight: '900', 
          color: 'var(--primary)', 
          letterSpacing: '-0.5px',
          textDecoration: 'none'
        }}>
          <Image 
            src="/logo.png" 
            alt="caridisini logo" 
            width={36} 
            height={36} 
            style={{ borderRadius: '8px', boxShadow: '0 4px 10px rgba(238, 77, 45, 0.1)' }}
          />
          caridisini
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hide-mobile" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <a href="#" style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.95rem' }}>Home</a>
          <a href="#produk" style={{ color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.95rem' }}>Produk</a>
          <a href="#tentang" style={{ color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.95rem' }}>Tentang</a>
          <a href="#kontak" style={{ color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.95rem' }}>Kontak</a>
          
          {isAuth && (
            <Link href="/admin" className="btn" style={{ background: 'var(--primary)', color: 'white', padding: '8px 16px', fontSize: '0.9rem' }}>
              Dashboard
            </Link>
          )}
        </nav>

        {/* Mobile Dashboard Link */}
        {isAuth && (
          <Link href="/admin" className="show-mobile" style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem' }}>
            Dashboard
          </Link>
        )}
      </div>
    </header>
  );
}
