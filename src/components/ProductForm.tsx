'use client';

import { useState } from "react";
import { addProduct, scrapeProductData, uploadFile, generateAiOptimization, updateProduct } from "@/app/actions";
import { Sparkles, Brain, X, Link as LinkIcon, Image as ImageIcon, Tag, DollarSign, Type, Info, CheckCircle2, AlertCircle, Loader2, UploadCloud, Wand2 } from "lucide-react";

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
        
        let successNote = "Data berhasil diambil secara otomatis!";
        if (!price) successNote += " (Harga tidak terdeteksi, silakan isi manual)";
        
        setMessage({ text: successNote, type: 'success' });
      } else {
        setMessage({ text: result.error || "Gagal mengambil data otomatis", type: 'error' });
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
        setMessage({ text: (result.error as string) || "AI gagal memproses data", type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: "Terjadi kesalahan sistem AI", type: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        setMessage({ text: "Produk berhasil ditambahkan ke katalog!", type: 'success' });
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

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    width: '100%'
  };

  const labelStyle = {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const premiumInput = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#fff',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    color: '#0f172a'
  };

  return (
    <div style={{ 
      backgroundColor: '#fff', 
      borderRadius: '24px', 
      boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      border: '1px solid #f1f5f9'
    }}>
      {/* Header Form */}
      <div style={{ 
        padding: '24px 32px', 
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to right, #ffffff, #fcfdff)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
            {formData.id ? 'Edit Detail Produk' : 'Tambah Produk Baru'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Lengkapi informasi produk pilihan Anda di bawah ini.</p>
        </div>
        {onCancel && (
          <button 
            onClick={onCancel} 
            style={{ 
              background: '#f1f5f9', 
              border: 'none', 
              color: '#64748b', 
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      <div style={{ padding: '32px' }}>
        {message && (
          <div style={{ 
            padding: '16px', 
            borderRadius: '12px', 
            marginBottom: '32px',
            backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            fontSize: '0.9rem',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'fadeUp 0.3s ease'
          }}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Section 1: Sumber Data */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '4px' }}>
              <div style={{ padding: '8px', background: 'rgba(238, 77, 45, 0.1)', borderRadius: '10px' }}>
                <LinkIcon size={18} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Sumber Data Shopee</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flexGrow: 1, minWidth: '300px' }}>
                <input 
                  type="url" 
                  name="shopeeUrl" 
                  required 
                  style={premiumInput}
                  placeholder="Paste URL Shopee di sini..." 
                  value={formData.shopeeUrl}
                  onChange={handleChange}
                  className="premium-input-focus"
                />
              </div>
              <button 
                type="button" 
                onClick={handleFetchData}
                disabled={loading}
                className="btn"
                style={{ 
                  background: '#0f172a', 
                  color: 'white',
                  borderRadius: '12px',
                  padding: '0 24px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: loading ? 0.7 : 1,
                  border: 'none',
                  cursor: 'pointer',
                  height: '52px'
                }}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                {loading ? 'Mengambil...' : 'Cari Info Otomatis'}
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
              Tips: Masukkan link Shopee lalu klik tombol di atas untuk mengisi form secara otomatis.
            </p>
          </div>

          <div style={{ height: '1px', background: '#f1f5f9' }}></div>

          {/* Section 2: Detail Produk */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', marginBottom: '4px' }}>
              <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '10px' }}>
                <Info size={18} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Informasi Produk</h3>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}><Type size={16} /> Nama Produk *</label>
              <input 
                type="text" 
                name="title" 
                required 
                style={premiumInput}
                placeholder="Masukkan judul produk yang menarik..." 
                value={formData.title}
                onChange={handleChange}
                className="premium-input-focus"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}><Tag size={16} /> Kategori</label>
                <input 
                  type="text" 
                  name="categoryName" 
                  style={premiumInput}
                  placeholder="Misal: Fashion Pria" 
                  value={formData.categoryName}
                  onChange={handleChange}
                  className="premium-input-focus"
                />
              </div>
              <div style={{ ...inputGroupStyle, justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={handleAiOptimize}
                  disabled={aiLoading || !formData.title}
                  style={{ 
                    background: 'linear-gradient(135deg, #EE4D2D 0%, #FF8E53 100%)', 
                    color: 'white',
                    height: '52px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 16px rgba(238, 77, 45, 0.15)',
                    opacity: (aiLoading || !formData.title) ? 0.6 : 1
                  }}
                >
                  <Sparkles size={18} />
                  {aiLoading ? 'AI Menganalisis...' : 'Optimasi Deskripsi & Kategori (AI)'}
                </button>
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}><Brain size={16} /> Deskripsi Produk</label>
              <textarea 
                name="description" 
                rows={6}
                style={{ ...premiumInput, resize: 'vertical', minHeight: '120px' }}
                placeholder="Tulis deskripsi produk di sini atau gunakan AI untuk membuat deskripsi yang menjual..." 
                value={formData.description}
                onChange={handleChange}
                className="premium-input-focus"
              />
            </div>
          </div>

          <div style={{ height: '1px', background: '#f1f5f9' }}></div>

          {/* Section 3: Media & Harga */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            
            {/* Visual Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', marginBottom: '4px' }}>
                <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '10px' }}>
                  <ImageIcon size={18} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Media Visual</h3>
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>URL Gambar Utama</label>
                <input 
                  type="text" 
                  name="imageUrl" 
                  required 
                  style={premiumInput}
                  placeholder="https://..." 
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="premium-input-focus"
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}><UploadCloud size={16} /> Upload Desktop (Opsional)</label>
                <div style={{ 
                  border: '2px dashed #e2e8f0', 
                  borderRadius: '16px', 
                  padding: '20px', 
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ 
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <UploadCloud size={32} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {uploading ? 'Sedang mengupload...' : 'Klik atau drag gambar ke sini'}
                  </p>
                </div>
              </div>

              {formData.imageUrl && (
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '20px', 
                  borderRadius: '16px', 
                  border: '1px solid #f1f5f9'
                }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pratinjau Galeri</p>
                  <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                    <div style={{ flexShrink: 0, position: 'relative' }}>
                      <img src={formData.imageUrl} alt="Main" style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '12px', border: '3px solid var(--primary)' }} />
                      <div style={{ position: 'absolute', top: '-6px', left: '-6px', background: 'var(--primary)', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>UTAMA</div>
                    </div>
                    {(() => {
                      try {
                        const gallery = JSON.parse(formData.images);
                        return gallery.filter((img: string) => img !== formData.imageUrl).map((img: string, i: number) => (
                          <img key={i} src={img} alt={`Gallery ${i}`} style={{ width: '90px', height: '90px', flexShrink: 0, objectFit: 'cover', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                        ));
                      } catch(e) { return null; }
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', marginBottom: '4px' }}>
                <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '10px' }}>
                  <DollarSign size={18} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Harga Produk</h3>
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Harga Promo (Rp) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: '#94a3b8' }}>Rp</span>
                  <input 
                    type="text" 
                    name="price" 
                    required 
                    style={{ ...premiumInput, paddingLeft: '45px' }}
                    placeholder="99.000" 
                    value={formData.price}
                    onChange={handleChange}
                    className="premium-input-focus"
                  />
                </div>
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Harga Sebelum Diskon (Opsional)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: '#94a3b8' }}>Rp</span>
                  <input 
                    type="text" 
                    name="originalPrice" 
                    style={{ ...premiumInput, paddingLeft: '45px', color: '#94a3b8' }}
                    placeholder="150.000" 
                    value={formData.originalPrice}
                    onChange={handleChange}
                    className="premium-input-focus"
                  />
                </div>
              </div>

              <div style={{ 
                marginTop: 'auto', 
                background: '#fff7ed', 
                border: '1px solid #ffedd5', 
                padding: '20px', 
                borderRadius: '16px' 
              }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ color: '#f97316' }}><Info size={20} /></div>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#9a3412', marginBottom: '4px' }}>Informasi Harga</p>
                    <p style={{ fontSize: '0.8rem', color: '#c2410c', lineHeight: '1.5' }}>
                      Pastikan nominal harga sudah benar. Harga coret akan ditampilkan sebagai pembanding diskon yang menarik bagi pembeli.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: '#f1f5f9', marginTop: '10px' }}></div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {onCancel && (
              <button 
                type="button" 
                onClick={onCancel}
                style={{ 
                  flex: 1,
                  padding: '16px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  color: '#64748b',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Batal
              </button>
            )}
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                flex: onCancel ? 2 : 1,
                padding: '16px',
                borderRadius: '14px',
                border: 'none',
                background: '#0f172a',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 10px 20px rgba(15, 23, 42, 0.15)',
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              {loading ? 'Menyimpan...' : (formData.id ? 'Perbarui Produk' : 'Simpan ke Katalog')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
