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
  const handleClick = async () => {
    const eventId = fpixel.generateEventId('AddToCart');
    const priceValue = price ? parseFloat(price.replace(/\D/g, '')) : 0;
    
    const eventData = {
      value: priceValue,
      currency: 'IDR',
      content_name: title || 'Product Detail Purchase',
      content_ids: [productId.toString()],
      content_type: 'product',
      contents: [{ id: productId.toString(), quantity: 1 }]
    };

    // 1. Browser Event
    fpixel.event('AddToCart', eventData, eventId);

    // 2. Server (CAPI) - Fetch for Transparency & Monitoring
    fetch('/api/meta-track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'AddToCart',
        eventID: eventId,
        customData: eventData
      }),
      keepalive: true
    })
    .then(res => res.json())
    .then(data => console.log('[CAPI Response] AddToCart (Detail):', data))
    .catch(err => console.error('[CAPI Error] AddToCart (Detail):', err));

    trackProductClick(productId);
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
