'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { trackProductClick } from '@/app/actions';

interface ProductProps {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  originalPrice: string | null;
  price: string;
  shopeeUrl: string;
  categoryName?: string;
}

export default function ProductCard({
  id,
  title,
  description,
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
          paddingTop: '100%', 
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
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {categoryName && (
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.6rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              zIndex: 10
            }}>
              {categoryName}
            </div>
          )}
        </div>

        <div style={{ padding: 'clamp(8px, 3vw, 16px)', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
            <Star size={12} fill="#FFD700" color="#FFD700" />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>5.0</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>(Terlaris)</span>
          </div>

          <h3 style={{ 
            fontSize: 'clamp(0.8rem, 2.5vw, 1rem)', 
            fontWeight: '700', 
            marginBottom: '4px', 
            color: 'var(--text-primary)',
            lineHeight: '1.3',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.6em'
          }}>
            {title}
          </h3>

          {description && (
             <p style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-secondary)', 
                lineHeight: '1.4',
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                marginBottom: '10px',
                minHeight: '2.8em'
             }}>
                {description}
             </p>
          )}
          
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)', fontWeight: '850', color: 'var(--primary)', lineHeight: '1.2' }}>Rp {price}</span>
              {originalPrice && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textDecoration: 'line-through', opacity: 0.7 }}>Rp {originalPrice}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
      <div style={{ padding: '0 12px 12px 12px' }}>
        <a
          href={shopeeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '0.8rem', padding: '8px 12px' }}
          onClick={() => trackProductClick(id)}
        >
          Beli
        </a>
      </div>
    </div>
  );
}
