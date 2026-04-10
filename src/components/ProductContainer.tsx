'use client';

import React, { useState } from 'react';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';

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

  const filteredProducts = selectedCategory
    ? initialProducts.filter(p => p.category?.name === selectedCategory)
    : initialProducts;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>
            {selectedCategory || 'Penawaran Hari Ini'}
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
           <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', fontWeight: '700' }}>Belum ada produk</h3>
           <p style={{ color: 'var(--text-secondary)' }}>Kategori "{selectedCategory}" sedang dalam kurasi!</p>
        </div>
      )}
    </>
  );
}
