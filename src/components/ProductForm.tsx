'use client';

import { useState } from "react";
import { addProduct, scrapeProductData, uploadFile } from "@/app/actions";

export default function ProductForm() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    categoryName: "",
    imageUrl: "",
    price: "",
    originalPrice: "",
    shopeeUrl: ""
  });
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const data = new FormData();
    data.append('file', file);

    try {
      const result = await uploadFile(data);
      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, imageUrl: result.url as string }));
        setMessage({ text: "Gambar berhasil diupload dari desktop!", type: 'success' });
      } else {
        setMessage({ text: result.error || "Gagal upload gambar", type: 'error' });
      }
    } catch (err) {
      setMessage({ text: "Terjadi kesalahan sistem saat upload", type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleFetchData = async () => {
    if (!formData.shopeeUrl) {
      setMessage({ text: "Masukkan link Shopee terlebih dahulu", type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const result = await scrapeProductData(formData.shopeeUrl);
      if (result.success && result.data) {
        const { title, imageUrl, price, categoryName } = result.data;
        
        // Check if we actually got meaningful data
        if (!title && !imageUrl) {
          setMessage({ text: "Data tidak ditemukan. Silakan isi secara manual.", type: 'error' });
          return;
        }

        setFormData(prev => ({
          ...prev,
          title: title || prev.title,
          imageUrl: imageUrl || prev.imageUrl,
          price: price || prev.price,
          categoryName: categoryName || prev.categoryName,
        }));
        
        let successNote = "Data berhasil diambil!";
        if (!price) successNote += " (Harga tidak terdeteksi, silakan isi manual)";
        
        setMessage({ text: successNote, type: 'success' });
      } else {
        setMessage({ text: result.error || "Gagal mengambil data", type: 'error' });
      }
    } catch (err) {
      setMessage({ text: "Terjadi kesalahan saat mengambil data", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card" style={{ padding: '32px', marginBottom: '40px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: '600' }}>Tambah Produk Baru</h2>
      
      {message && (
        <div style={{ 
          padding: '12px 16px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#22c55e' : '#ef4444',
          fontSize: '0.875rem',
          border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`
        }}>
          {message.text}
        </div>
      )}

      <form action={addProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Link Shopee Affiliate *</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="url" 
              name="shopeeUrl" 
              required 
              className="input-field" 
              placeholder="https://shope.ee/..." 
              value={formData.shopeeUrl}
              onChange={handleChange}
              style={{ flexGrow: 1 }}
            />
            <button 
              type="button" 
              onClick={handleFetchData}
              disabled={loading}
              className="btn"
              style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--primary)', 
                color: 'var(--primary)',
                whiteSpace: 'nowrap',
                padding: '0 20px',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Mencari...' : 'Cek Info Produk'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Nama Produk *</label>
            <input 
              type="text" 
              name="title" 
              required 
              className="input-field" 
              placeholder="Misal: Sepatu Olahraga Pria" 
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Kategori (Opsional)</label>
            <input 
              type="text" 
              name="categoryName" 
              className="input-field" 
              placeholder="Misal: Fashion" 
              value={formData.categoryName}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>URL Gambar / Path Lokal *</label>
            <input 
              type="text" 
              name="imageUrl" 
              required 
              className="input-field" 
              placeholder="https://... atau /uploads/..." 
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Atau Upload dari Desktop</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileUpload}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  fontSize: '0.875rem',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
              />
              {uploading && (
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px' }}>Sedang mengupload...</div>
              )}
            </div>
          </div>
        </div>

        {formData.imageUrl && (
          <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.05)', padding: '12px', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Preview Media:</p>
            <img src={formData.imageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Harga Diskon (Rp) *</label>
            <input 
              type="text" 
              name="price" 
              required 
              className="input-field" 
              placeholder="99.000" 
              value={formData.price}
              onChange={handleChange}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Harga Coret (Opsional)</label>
            <input 
              type="text" 
              name="originalPrice" 
              className="input-field" 
              placeholder="150.000" 
              value={formData.originalPrice}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Simpan Produk ke Katalog</button>
        </div>
      </form>
    </div>
  );
}
