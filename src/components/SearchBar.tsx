'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as fpixel from '@/lib/fpixel';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!query.trim()) {
      router.push('/');
      return;
    }

    // --- Meta Tracking (Search) ---
    const eventId = fpixel.generateEventId('Search');
    const eventData = {
      search_string: query.trim(),
      content_category: 'Product Search',
      value: 0,
      currency: 'IDR',
      content_ids: []
    };

    // 1. Browser Event
    fpixel.event('Search', eventData, eventId);

    // 2. Server (CAPI) - Fetch for Transparency & Monitoring
    fetch('/api/meta-track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'Search',
        eventID: eventId,
        customData: eventData
      }),
      keepalive: true
    })
    .then(res => res.json())
    .then(data => console.log('[CAPI Response] Search:', data))
    .catch(err => console.error('[CAPI Error] Search:', err));

    // Update URL
    router.push(`/?q=${encodeURIComponent(query.trim())}#produk`);
  };

  return (
    <form onSubmit={handleSearch} style={{ width: '100%' }}>
      <div style={{ 
        position: 'relative',
        background: 'white',
        borderRadius: '100px',
        padding: '8px',
        boxShadow: '0 30px 60px -15px rgba(238, 77, 45, 0.2)',
        display: 'flex',
        alignItems: 'center',
        border: '1px solid rgba(238, 77, 45, 0.1)'
      }}>
        <div style={{ paddingLeft: '24px', marginRight: '8px' }}>
          <Search size={22} color="var(--text-secondary)" />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari barang berdiskon di Shopee..." 
          style={{ 
            border: 'none', 
            padding: '16px 0', 
            fontSize: '1.1rem', 
            width: '100%', 
            outline: 'none',
            background: 'transparent'
          }}
        />
        <button 
          type="submit"
          className="btn btn-primary" 
          style={{ padding: '16px 36px', fontSize: '1rem', whiteSpace: 'nowrap' }}
        >
          Cari Sekarang
        </button>
      </div>
    </form>
  );
}
