'use client';

import { useEffect } from 'react';
import * as fpixel from '@/lib/fpixel';

interface PixelViewContentProps {
  id: number;
  title: string;
  price: string;
  category?: string;
}

export default function PixelViewContent({ id, title, price, category }: PixelViewContentProps) {
  useEffect(() => {
    const eventId = fpixel.generateEventId();
    const priceValue = parseFloat(price.replace(/\D/g, ''));
    
    const eventData = {
      content_ids: [id.toString()],
      content_name: title,
      content_category: category || 'Product',
      content_type: 'product',
      value: priceValue,
      currency: 'IDR',
      contents: [{ id: id.toString(), quantity: 1 }]
    };

    // 1. Browser (Pixel)
    fpixel.event('ViewContent', eventData, eventId);

    // 2. Server (CAPI) - Fetch for Transparency & Monitoring
    fetch('/api/meta-track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'ViewContent',
        eventID: eventId,
        customData: eventData
      }),
      keepalive: true
    })
    .then(res => res.json())
    .then(data => console.log('[CAPI Response] ViewContent:', data))
    .catch(err => console.error('[CAPI Error] ViewContent:', err));

  }, [id, title, price, category]);

  return null;
}
