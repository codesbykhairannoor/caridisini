import Link from 'next/link';
import { checkAuth } from '@/app/actions';

export default async function Header() {
  const isAuth = await checkAuth();

  return (
    <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'clamp(60px, 10vw, 72px)' }}>
        <Link href="/" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: '700', color: 'var(--primary)', letterSpacing: '-0.5px' }}>
          caridisini
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hide-mobile" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Home</Link>
          <a href="#kategori" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Kategori</a>
          
          {isAuth && (
            <Link href="/admin" className="btn" style={{ background: 'var(--primary)', color: 'white', padding: '8px 16px' }}>
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
