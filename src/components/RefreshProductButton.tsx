'use client';

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { refreshProductData } from "@/app/actions";

interface RefreshProductButtonProps {
  productId: number;
}

export default function RefreshProductButton({ productId }: RefreshProductButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshProductData(productId);
      // Optional: show a success toast or message
    } catch (err) {
      alert('Gagal menyegarkan data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleRefresh}
      disabled={loading}
      title="Refresh Data (Ambil ulang dari Shopee)"
      style={{ 
        background: 'transparent', 
        border: 'none', 
        color: 'var(--primary)', 
        cursor: loading ? 'not-allowed' : 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px',
        opacity: loading ? 0.5 : 1,
        transition: 'all 0.2s'
      }}
    >
      <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
    </button>
  );
}
