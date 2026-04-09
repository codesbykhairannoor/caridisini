import Link from 'next/link';
import Image from 'next/image';
import { checkAuth } from '@/app/actions';

export default async function Header() {
  const isAuth = await checkAuth();

  return (
    <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: 'clamp(60px, 10vw, 72px)' }}>
        {/* Desktop Nav - Only Dashboard if Auth */}
        <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center' }}>
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
