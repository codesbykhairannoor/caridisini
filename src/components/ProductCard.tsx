'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { trackProductClick } from '@/app/actions';
import * as fpixel from '@/lib/fpixel';
import WishlistToggle from './WishlistToggle';

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
  
  const trackAddToCart = (source: string) => {
    const eventId = fpixel.generateEventId();
    const priceValue = parseFloat(price.replace(/\D/g, ''));
    
    const eventData = {
      value: priceValue,
      currency: 'IDR',
      content_name: title,
      content_ids: [id.toString()],
      content_type: 'product',
      contents: [{ id: id.toString(), quantity: 1 }]
    };

    // 1. Browser Event
    fpixel.event('AddToCart', eventData, eventId);

    // 2. Server Event - Total Silent Tracking via sendBeacon
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const data = JSON.stringify({
        eventName: 'AddToCart',
        eventID: eventId,
        customData: eventData
      });
      const blob = new Blob([data], { type: 'application/json' });
      navigator.sendBeacon('/api/meta-track', blob);
    }
    
    // Legacy tracking
    trackProductClick(id);
  };

  const handleShopeeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    trackAddToCart('Beli Sekarang');
    window.open(shopeeUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDetailClick = () => {
    trackAddToCart('Lihat Detail');
  };

  return (
    <div className="card animate-fade-up" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Upper clickable area to Detail Page */}
      <Link href={`/product/${id}`} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
        {/* 1:1 Image Container */}
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          paddingTop: '100%', 
          overflow: 'hidden',
          background: '#f1f5f9'
        }}>
          <Image
            src={imageUrl}
            alt={title}
            fill
            style={{ 
              objectFit: 'cover',
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="product-image"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          
          {/* Wishlist Toggle Overlay */}
          <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 20 }}>
            <WishlistToggle productId={id} productTitle={title} productPrice={price} />
          </div>

          {/* Etalase / Showcase Number Badge */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '50px',
            fontSize: '0.7rem',
            fontWeight: '800',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span style={{ opacity: 0.8 }}>No.</span> {id}
          </div>

          {/* Discount Badge */}
          {originalPrice && (
            <div style={{
              position: 'absolute',
              top: '42px',
              left: '12px',
              background: 'var(--primary)',
              color: 'white',
              padding: '4px 10px',
              borderRadius: '50px',
              fontSize: '0.7rem',
              fontWeight: '800',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(238, 77, 45, 0.3)'
            }}>
              SALE
            </div>
          )}

          {categoryName && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              color: 'var(--text-primary)',
              padding: '4px 12px',
              borderRadius: '50px',
              fontSize: '0.65rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              {categoryName}
            </div>
          )}
        </div>

        <div style={{ padding: 'clamp(12px, 3vw, 20px)', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Rating & Social Proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '1px' }}>
              <Star size={12} fill="#FFD700" color="#FFD700" />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>5.0</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '500' }}>• 10k+ Terjual</span>
          </div>

          <h3 style={{ 
            fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', 
            fontWeight: '800', 
            marginBottom: '8px', 
            color: '#0F172A',
            lineHeight: '1.2',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.4em'
          }}>
            {title}
          </h3>

          {description && (
             <p style={{ 
                fontSize: '0.8rem', 
                color: 'var(--text-secondary)', 
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                marginBottom: '16px',
                minHeight: '3em'
             }}>
                {description}
             </p>
          )}
          
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-0.5px' }}>
                Rp {price}
              </span>
              {originalPrice && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textDecoration: 'line-through', opacity: 0.6 }}>
                  Rp {originalPrice}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
      
      {/* Dual CTA Buttons */}
      <div style={{ 
        padding: '0 16px 16px 16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px' 
      }}>
        <button
          onClick={handleShopeeClick}
          className="btn btn-primary"
          style={{ width: '100%', gap: '8px', padding: '10px 0', fontSize: '0.85rem' }}
        >
          <ShoppingCart size={14} />
          Beli Sekarang
        </button>
        <Link 
          href={`/product/${id}`}
          onClick={handleDetailClick}
          style={{ 
            width: '100%', 
            padding: '10px 0', 
            fontSize: '0.85rem', 
            textAlign: 'center', 
            border: '1px solid var(--border-color)', 
            borderRadius: '50px',
            color: 'var(--text-secondary)',
            fontWeight: '700',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          className="btn-hover-scale"
        >
          <Eye size={14} />
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}
