'use client';

import React from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (name: string | null) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '12px', 
      overflowX: 'auto', 
      paddingBottom: '16px',
      marginBottom: '32px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      WebkitOverflowScrolling: 'touch'
    }}>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      <button
        onClick={() => onSelectCategory(null)}
        style={{
          padding: '10px 24px',
          borderRadius: '50px',
          border: '1px solid',
          borderColor: selectedCategory === null ? 'var(--primary)' : 'var(--border-color)',
          background: selectedCategory === null ? 'var(--primary)' : 'white',
          color: selectedCategory === null ? 'white' : 'var(--text-secondary)',
          fontWeight: '700',
          fontSize: '0.9rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: selectedCategory === null ? '0 8px 15px -4px rgba(238, 77, 45, 0.3)' : 'none',
        }}
      >
        Semua
      </button>

      <button
        onClick={() => onSelectCategory('Favorit')}
        style={{
          padding: '10px 24px',
          borderRadius: '50px',
          border: '1px solid',
          borderColor: selectedCategory === 'Favorit' ? '#ff4d6d' : 'var(--border-color)',
          background: selectedCategory === 'Favorit' ? '#ff4d6d' : 'white',
          color: selectedCategory === 'Favorit' ? 'white' : '#ff4d6d',
          fontWeight: '700',
          fontSize: '0.9rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: selectedCategory === 'Favorit' ? '0 8px 15px -4px rgba(255, 77, 109, 0.3)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        Favorit 💖
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.name)}
          style={{
            padding: '10px 24px',
            borderRadius: '50px',
            border: '1px solid',
            borderColor: selectedCategory === cat.name ? 'var(--primary)' : 'var(--border-color)',
            background: selectedCategory === cat.name ? 'var(--primary)' : 'white',
            color: selectedCategory === cat.name ? 'white' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: selectedCategory === cat.name ? '0 8px 15px -4px rgba(238, 77, 45, 0.3)' : 'none',
          }}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
