'use client';

import { useState } from "react";
import { addProduct, scrapeProductData, uploadFile, generateAiOptimization, updateProduct } from "@/app/actions";
import { Sparkles, Brain, X } from "lucide-react";

interface ProductFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProductForm({ initialData, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    id: initialData?.id || null,
    title: initialData?.title || "",
    description: initialData?.description || "",
    categoryName: initialData?.category?.name || "",
    imageUrl: initialData?.imageUrl || "",
    images: initialData?.images || "[]", 
    price: initialData?.price || "",
    originalPrice: initialData?.originalPrice || "",
    shopeeUrl: initialData?.shopeeUrl || ""
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
        const { title, description, imageUrl, images, price, categoryName } = result.data;
        
        // Check if we actually got meaningful data
        if (!title && !imageUrl) {
          setMessage({ text: "Data tidak ditemukan. Silakan isi secara manual.", type: 'error' });
          return;
        }

        setFormData(prev => ({
          ...prev,
          title: title || prev.title,
          description: description || prev.description,
          imageUrl: imageUrl || prev.imageUrl,
          images: images || prev.images,
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

  const handleAiOptimize = async () => {
    if (!formData.title) {
      setMessage({ text: "Silakan ambil data produk atau isi judul terlebih dahulu", type: 'error' });
      return;
    }

    setAiLoading(true);
    setMessage(null);
    try {
      const result = await generateAiOptimization(formData.title, formData.description);
      if (result.success && result.data) {
        const { categoryName, polishedDescription } = result.data;
        setFormData(prev => ({
          ...prev,
          categoryName: categoryName || prev.categoryName,
          description: polishedDescription || prev.description
        }));
        setMessage({ text: "AI berhasil mengoptimasi kategori dan deskripsi!", type: 'success' });
      } else {
        if (typeof result.error === 'string' && (result.error.includes("apiKey") || result.error.includes("API_KEY"))) {
          setMessage({ text: "Error: GEMINI_API_KEY belum dikonfigurasi di .env", type: 'error' });
        } else {
          setMessage({ text: (result.error as string) || "AI gagal memproses data", type: 'error' });
        }
      }
    } catch (err: any) {
      setMessage({ text: "Terjadi kesalahan sistem AI", type: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) fd.append(key, value.toString());
    });

    try {
      if (formData.id) {
        await updateProduct(formData.id, fd);
        setMessage({ text: "Produk berhasil diperbarui!", type: 'success' });
      } else {
        await addProduct(fd);
        setMessage({ text: "Produk berhasil ditambahkan!", type: 'success' });
        // Reset form if it was a new product
        setFormData({
          id: null,
          title: "",
          description: "",
          categoryName: "",
          imageUrl: "",
          images: "[]",
          price: "",
          originalPrice: "",
          shopeeUrl: ""
        });
      }
      if (onSuccess) setTimeout(onSuccess, 1500);
    } catch (err: any) {
      setMessage({ text: err.message || "Terjadi kesalahan saat menyimpan", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '32px', marginBottom: '40px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
          {formData.id ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h2>
        {onCancel && (
          <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        )}
      </div>
      
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <input type="hidden" name="images" value={formData.images} />
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Link Shopee Affiliate *</label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input 
              type="url" 
              name="shopeeUrl" 
              required 
              className="input-field" 
              placeholder="https://shope.ee/..." 
              value={formData.shopeeUrl}
              onChange={handleChange}
              style={{ flexGrow: 1, minWidth: '300px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
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
              
              <button 
                type="button" 
                onClick={handleAiOptimize}
                disabled={aiLoading || !formData.title}
                className="btn"
                style={{ 
                  background: 'linear-gradient(45deg, #EE4D2D, #FF8E53)', 
                  border: 'none', 
                  color: 'white',
                  whiteSpace: 'nowrap',
                  padding: '0 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: (aiLoading || !formData.title) ? 0.6 : 1,
                  boxShadow: '0 4px 15px rgba(238, 77, 45, 0.2)'
                }}
              >
                <Sparkles size={16} />
                {aiLoading ? 'AI Thinking...' : 'AI Magic Optimize'}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Deskripsi Produk (Auto-generated)</label>
          <textarea 
            name="description" 
            className="input-field" 
            rows={4}
            placeholder="Deskripsi produk akan muncul di sini secara otomatis..." 
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            style={{ width: '100%', resize: 'vertical' }}
          />
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
          <div style={{ background: 'rgba(0,0,0,0.05)', padding: '16px', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px', textAlign: 'center' }}>Pratinjau Galeri:</p>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
               {/* Main Image First */}
               <div style={{ flexShrink: 0, position: 'relative' }}>
                 <img src={formData.imageUrl} alt="Main" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--primary)' }} />
                 <span style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'var(--primary)', color: 'white', fontSize: '8px', padding: '1px 4px', borderRadius: '4px' }}>Utama</span>
               </div>
               {/* Additional Images */}
               {(() => {
                 try {
                   const gallery = JSON.parse(formData.images);
                   return gallery.filter((img: string) => img !== formData.imageUrl).map((img: string, i: number) => (
                     <img key={i} src={img} alt={`Gallery ${i}`} style={{ width: '80px', height: '80px', flexShrink: 0, objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                   ));
                 } catch(e) { return null; }
               })()}
            </div>
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
