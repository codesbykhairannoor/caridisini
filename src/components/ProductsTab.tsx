'use client';

import React from 'react';
import RefreshProductButton from './RefreshProductButton';
import DeleteProductButton from './DeleteProductButton';
import { ExternalLink, Edit2 } from 'lucide-react';

interface ProductsTabProps {
  products: any[];
  onEdit: (product: any) => void;
}

export default function ProductsTab({ products, onEdit }: ProductsTabProps) {
  return (
    <div className="card" style={{ overflow: 'hidden', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
      <div style={{ padding: 'clamp(16px, 4vw, 24px)', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Katalog Produk ({products.length})</h3>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <tr>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600' }}>Produk</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600' }}>Harga</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600' }}>Statistik</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600' }}>Aksi</th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'white' }}>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
                  Belum ada produk. Silakan tambah produk di tab 'Tambah Baru'.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="table-row-hover" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                  <td data-label="Produk" style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f3f4f6' }}>
                        <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '4px' }}>
                          {product.title.length > 50 ? product.title.substring(0, 50) + '...' : product.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#64748b' }}>
                            {product.category?.name || 'Uncategorized'}
                          </span>
                          <a href={product.shopeeUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            Link <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Harga" style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--primary)' }}>Rp {product.price}</div>
                    {product.originalPrice && (
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', textDecoration: 'line-through' }}>Rp {product.originalPrice}</div>
                    )}
                  </td>
                  <td data-label="Statistik" style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827' }}>{product.clicks || 0}</span>
                      <span style={{ fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase' }}>Klik</span>
                    </div>
                  </td>
                  <td data-label="Aksi" style={{ padding: '16px 24px', textAlign: 'right' }}>
                     <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                       <button 
                         onClick={() => onEdit(product)}
                         title="Edit Produk"
                         style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                       >
                         <Edit2 size={18} />
                       </button>
                       <RefreshProductButton productId={product.id} />
                       <DeleteProductButton productId={product.id} />
                     </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
