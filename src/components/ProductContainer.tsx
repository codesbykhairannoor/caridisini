'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import { useSearchParams } from 'next/navigation';
import { getWishlist } from '@/lib/wishlist';

interface Product {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  originalPrice: string | null;
  price: string;
  shopeeUrl: string;
  category?: {
    name: string;
  } | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductContainerProps {
  initialProducts: any[];
  categories: Category[];
}

export default function ProductContainer({ initialProducts, categories }: ProductContainerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';

  useEffect(() => {
    // Initial load
    setSavedIds(getWishlist());

    // Listen for updates
    const handleUpdate = () => {
      setSavedIds(getWishlist());
    };
    window.addEventListener('wishlist-updated', handleUpdate);
    return () => window.removeEventListener('wishlist-updated', handleUpdate);
  }, []);

  const filteredProducts = initialProducts.filter(p => {
    // 1. Category/Favorit Filter
    let matchesCategory = true;
    if (selectedCategory === 'Favorit') {
      matchesCategory = savedIds.includes(p.id);
    } else if (selectedCategory) {
      matchesCategory = p.category?.name === selectedCategory;
    }

    // 2. Search Filter
    const matchesSearch = searchQuery 
      ? p.title.toLowerCase().includes(searchQuery) || 
        p.description?.toLowerCase().includes(searchQuery)
      : true;

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>
            {searchQuery ? `Hasil Cari: "${searchQuery}"` : (selectedCategory === 'Favorit' ? 'Barang Simpanan Anda 💖' : (selectedCategory || 'Penawaran Hari Ini'))}
          </h2>
        </div>
      </div>

      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id}
              id={product.id}
              title={product.title}
              description={product.description}
              imageUrl={product.imageUrl}
              originalPrice={product.originalPrice}
              price={product.price}
              shopeeUrl={product.shopeeUrl}
              categoryName={product.category?.name}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
           <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', fontWeight: '700' }}>
             {selectedCategory === 'Favorit' ? 'Belum ada favorit' : 'Belum ada produk'}
           </h3>
           <p style={{ color: 'var(--text-secondary)' }}>
             {selectedCategory === 'Favorit' ? 'Klik ikon hati pada produk untuk simpan di sini!' : `Kategori "${selectedCategory}" sedang dalam kurasi!`}
           </p>
        </div>
      )}
    </>
  );
}
