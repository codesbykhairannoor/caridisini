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
    fpixel.event('ViewContent', {
      content_ids: [id.toString()],
      content_name: title,
      content_category: category || 'Product',
      content_type: 'product',
      value: parseFloat(price.replace(/\D/g, '')),
      currency: 'IDR',
    });
  }, [id, title, price, category]);

  return null;
}
