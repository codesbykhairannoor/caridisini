'use client';

import Image from 'next/image';

interface ProductProps {
  title: string;
  imageUrl: string;
  originalPrice: string | null;
  price: string;
  shopeeUrl: string;
  categoryName?: string;
}

export default function ProductCard({
  title,
  imageUrl,
  originalPrice,
  price,
  shopeeUrl,
  categoryName,
}: ProductProps) {
  return (
    <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
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

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          marginBottom: '10px', 
          lineHeight: '1.5',
          color: 'var(--text-primary)',
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical', 
          overflow: 'hidden',
          minHeight: '3rem'
        }}>
          {title}
        </h3>
        
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
              Rp {price}
            </span>
            {originalPrice && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                Rp {originalPrice}
              </span>
            )}
          </div>
          <a
            href={shopeeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.9rem' }}
          >
            Beli di Shopee
          </a>
        </div>
      </div>
    </div>
  );
}
