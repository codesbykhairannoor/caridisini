import React from 'react';
import ProductForm from './ProductForm';

interface AddProductTabProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddProductTab({ initialData, onSuccess, onCancel }: AddProductTabProps) {
  return (
    <div style={{ maxWidth: '900px' }}>
      {!initialData && (
        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', padding: '20px', borderRadius: '16px', marginBottom: '32px' }}>
          <h4 style={{ color: '#9a3412', fontWeight: '700', fontSize: '0.95rem', marginBottom: '8px' }}>Pusat Input Produk</h4>
          <p style={{ color: '#c2410c', fontSize: '0.85rem', lineHeight: '1.5' }}>
            Masukkan tautan Shopee Affiliate Anda di bawah ini. Sistem kami akan secara otomatis mengambil data produk dan 
            mengoptimasi deskripsi menggunakan AI untuk performa penjualan yang lebih tinggi.
          </p>
        </div>
      )}
      <ProductForm initialData={initialData} onSuccess={onSuccess} onCancel={onCancel} />
    </div>
  );
}
