import Link from 'next/link';
import { checkAuth } from '@/app/actions';

export default async function Header() {
  const isAuth = await checkAuth();

  return (
    <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', letterSpacing: '-0.5px' }}>
          caridisni
        </Link>
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Home</Link>
          <a href="#kategori" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Kategori</a>
          
          {isAuth && (
            <Link href="/admin" className="btn" style={{ background: 'var(--primary)', color: 'white', padding: '8px 16px' }}>
              Dashboard
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
