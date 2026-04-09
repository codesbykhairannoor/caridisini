'use client';

import Image from 'next/image';
import Link from 'next/link';
import { trackProductClick } from '@/app/actions';

interface ProductProps {
  id: number;
  title: string;
  imageUrl: string;
  originalPrice: string | null;
  price: string;
  shopeeUrl: string;
  categoryName?: string;
}

export default function ProductCard({
  id,
  title,
  imageUrl,
  originalPrice,
  price,
  shopeeUrl,
  categoryName,
}: ProductProps) {
  return (
    <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <Link href={`/product/${id}`} style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none', color: 'inherit' }}>
        {/* 1:1 Image Container */}
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          paddingTop: '100%', /* Forces 1:1 Aspect Ratio */
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <Image
            src={imageUrl}
            alt={title}
            fill
            style={{ 
              objectFit: 'cover',
              transition: 'transform 0.5s ease'
            }}
            className="product-image"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {categoryName && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              color: 'white',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.65rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              zIndex: 10,
              maxWidth: '80%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {categoryName}
            </div>
          )}
        </div>

        <div style={{ padding: 'clamp(12px, 3vw, 20px)', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ 
            fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', 
            fontWeight: '700', 
            marginBottom: '8px', 
            color: 'var(--text-primary)',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.8em'
          }}>
            {title}
          </h3>
          
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.3rem)', fontWeight: '850', color: 'var(--primary)', lineHeight: '1.2' }}>Rp {price}</span>
              {originalPrice && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textDecoration: 'line-through', opacity: 0.7 }}>Rp {originalPrice}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <a
          href={shopeeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '0.9rem' }}
          onClick={() => trackProductClick(id)}
        >
          Beli di Shopee
        </a>
      </div>
    </div>
  );
}
