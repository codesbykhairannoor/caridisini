'use client';

import { useEffect } from 'react';
import * as fpixel from '@/lib/fpixel';
import { trackMetaEvent } from '@/app/actions';

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

    // 2. Server (CAPI)
    trackMetaEvent('ViewContent', eventId, eventData);

  }, [id, title, price, category]);

  return null;
}
