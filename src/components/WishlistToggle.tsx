'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { isInWishlist, addToWishlist, removeFromWishlist } from '@/lib/wishlist';
import * as fpixel from '@/lib/fpixel';

interface WishlistToggleProps {
  productId: number;
  productTitle: string;
  productPrice: string;
}

export default function WishlistToggle({ productId, productTitle, productPrice }: WishlistToggleProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(isInWishlist(productId));
  }, [productId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaved) {
      removeFromWishlist(productId);
      setIsSaved(false);
    } else {
      addToWishlist(productId);
      setIsSaved(true);

      // --- Meta Tracking (AddToWishlist) ---
      const eventId = fpixel.generateEventId();
      const price = parseFloat(productPrice.replace(/\D/g, ''));
      
      // 1. Browser (Pixel)
      fpixel.event('AddToWishlist', {
        content_ids: [productId.toString()],
        content_name: productTitle,
        content_type: 'product',
        value: price,
        currency: 'IDR'
      }, eventId);

      // 2. Server (CAPI) - Background fetch to avoid triggering NProgress/Loading bars
      fetch('/api/meta-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'AddToWishlist',
          eventID: eventId,
          customData: {
            content_ids: [productId.toString()],
            content_name: productTitle,
            content_type: 'product',
            value: price,
            currency: 'IDR'
          }
        })
      }).catch(err => console.error('[Meta CAPI] Event Error:', err));
    }
  };

  return (
    <button 
      onClick={handleToggle}
      className={`wishlist-btn ${isSaved ? 'is-saved' : ''}`}
      style={{
        background: isSaved ? 'rgba(238, 77, 45, 0.1)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        border: '1px solid ' + (isSaved ? 'var(--primary)' : 'rgba(0,0,0,0.05)'),
        padding: '8px',
        borderRadius: '50%',
        color: isSaved ? 'var(--primary)' : '#64748b',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isSaved ? '0 4px 12px rgba(238, 77, 45, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)'
      }}
    >
      <Heart size={18} fill={isSaved ? "currentColor" : "none"} strokeWidth={2.5} />
      
      <style jsx>{`
        .wishlist-btn:hover {
          transform: scale(1.15);
          border-color: var(--primary);
          color: var(--primary);
        }
        .wishlist-btn:active {
          transform: scale(0.95);
        }
      `}</style>
    </button>
  );
}
