'use client';

import { ShoppingBag } from "lucide-react";
import { trackProductClick } from "@/app/actions";
import * as fpixel from '@/lib/fpixel';

interface PurchaseButtonProps {
  productId: number;
  url: string;
  variant?: 'default' | 'compact';
  title?: string;
  price?: string;
}

export default function PurchaseButton({ productId, url, variant = 'default', title, price }: PurchaseButtonProps) {
  const handleClick = () => {
    trackProductClick(productId);

    // Track Facebook Pixel Event
    fpixel.event('Purchase', {
      value: price ? parseFloat(price.replace(/\D/g, '')) : 0,
      currency: 'IDR',
      content_name: title || 'Product Detail Purchase',
      content_ids: [productId.toString()],
      content_type: 'product'
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isCompact = variant === 'compact';

  return (
    <button
      onClick={handleClick}
      style={{
        width: '100%',
        padding: isCompact ? '12px 16px' : '18px',
        background: 'linear-gradient(45deg, #EE4D2D, #FF8E53)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: isCompact ? '0.95rem' : '1.1rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isCompact ? '8px' : '12px',
        cursor: 'pointer',
        boxShadow: '0 10px 25px rgba(238, 77, 45, 0.25)',
        transition: 'all 0.3s ease'
      }}
      className="btn-hover-scale"
    >
      <ShoppingBag size={isCompact ? 18 : 22} />
      {isCompact ? 'Beli Sekarang' : 'Beli Sekarang di Shopee'}
    </button>
  );
}
