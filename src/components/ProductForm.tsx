'use client';

import { useState } from "react";
import { addProduct, scrapeProductData, uploadFile, generateAiOptimization, updateProduct } from "@/app/actions";
import { Sparkles, X, Link as LinkIcon, Image as ImageIcon, Tag, DollarSign, Type, Info, CheckCircle2, AlertCircle, Loader2, UploadCloud, Wand2, Save } from "lucide-react";

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
        setMessage({ text: "Upload berhasil!", type: 'success' });
      } else {
        setMessage({ text: result.error || "Gagal upload", type: 'error' });
      }
    } catch (err) {
      setMessage({ text: "Error upload", type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleFetchData = async () => {
    if (!formData.shopeeUrl) {
      setMessage({ text: "Masukkan link Shopee", type: 'error' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const result = await scrapeProductData(formData.shopeeUrl);
      if (result.success && result.data) {
        const { title, description, imageUrl, images, price, categoryName } = result.data;
        setFormData(prev => ({
          ...prev,
          title: title || prev.title,
          description: description || prev.description,
          imageUrl: imageUrl || prev.imageUrl,
          images: images || prev.images,
          price: price || prev.price,
          categoryName: categoryName || prev.categoryName,
        }));
        setMessage({ text: "Autofill berhasil!", type: 'success' });
      } else {
        setMessage({ text: "Shopee memblokir akses otomatis. Silakan isi manual.", type: 'error' });
      }
    } catch (err) {
      setMessage({ text: "Error scraping data", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAiOptimize = async () => {
    if (!formData.title) return;
    setAiLoading(true);
    setMessage(null);
    try {
      const result = await generateAiOptimization(formData.title, formData.description);
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          categoryName: result.data.categoryName || prev.categoryName,
          description: result.data.polishedDescription || prev.description
        }));
        setMessage({ text: "AI Optimized!", type: 'success' });
      }
    } catch (err: any) {
      setMessage({ text: "AI Error", type: 'error' });
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
        setMessage({ text: "Terupdate!", type: 'success' });
      } else {
        await addProduct(fd);
        setMessage({ text: "Tersimpan!", type: 'success' });
        setFormData({ id: null, title: "", description: "", categoryName: "", imageUrl: "", images: "[]", price: "", originalPrice: "", shopeeUrl: "" });
      }
      if (onSuccess) setTimeout(onSuccess, 1000);
    } catch (err: any) {
      setMessage({ text: "Gagal simpan", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em'
  };

  const compactInput = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    color: '#0f172a',
    transition: 'border-color 0.2s'
  };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', width: '100%' }}>
      
      {/* Header Compact */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', background: 'rgba(238, 77, 45, 0.1)', borderRadius: '10px', color: 'var(--primary)' }}>
            <LinkIcon size={18} />
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
            {formData.id ? 'Edit Produk' : 'Tambah Produk'}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
             {message && (
                <div style={{ fontSize: '0.85rem', color: message.type === 'success' ? '#166534' : '#991b1b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
             )}
            {onCancel && (
                <button onClick={onCancel} style={{ background: '#f8fafc', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', color: '#94a3b8' }}>
                    <X size={18} />
                </button>
            )}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Baris 1: Shopee URL & AI */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'flex-end' }}>
            <div>
                <label style={labelStyle}>URL Shopee Affiliate</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="url" name="shopeeUrl" required style={compactInput} value={formData.shopeeUrl} onChange={handleChange} placeholder="https://shope.ee/..." />
                    <button type="button" onClick={handleFetchData} disabled={loading} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                        Cek Info
                    </button>
                </div>
            </div>
            <button type="button" onClick={handleAiOptimize} disabled={aiLoading || !formData.title} style={{ height: '42px', padding: '0 16px', background: 'linear-gradient(135deg, #EE4D2D, #FF8E53)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: (aiLoading || !formData.title) ? 0.6 : 1 }}>
                <Sparkles size={16} />
                {aiLoading ? 'Thinking...' : 'AI Magic'}
            </button>
        </div>

        {/* Baris 2: Judul & Kategori */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div>
                <label style={labelStyle}>Nama Produk</label>
                <input type="text" name="title" required style={compactInput} value={formData.title} onChange={handleChange} placeholder="Judul Produk" />
            </div>
            <div>
                <label style={labelStyle}>Kategori</label>
                <input type="text" name="categoryName" style={compactInput} value={formData.categoryName} onChange={handleChange} placeholder="Kategori" />
            </div>
        </div>

        {/* Baris 3: Harga Diskon, Harga Coret, Upload */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '16px', alignItems: 'flex-end' }}>
            <div>
                <label style={labelStyle}>Harga Diskon (Rp)</label>
                <input type="text" name="price" required style={compactInput} value={formData.price} onChange={handleChange} placeholder="99.000" />
            </div>
            <div>
                <label style={labelStyle}>Harga Coret</label>
                <input type="text" name="originalPrice" style={compactInput} value={formData.originalPrice} onChange={handleChange} placeholder="150.000" />
            </div>
            <div>
                <label style={labelStyle}>Upload Desktop</label>
                <div style={{ position: 'relative' }}>
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ position: 'absolute', inset:0, opacity:0, cursor:'pointer' }} />
                    <div style={{ ...compactInput, display:'flex', alignItems:'center', gap:'8px', background:'#f8fafc', color:'#64748b', fontSize:'0.8rem', borderStyle:'dashed' }}>
                        <UploadCloud size={16} />
                        {uploading ? 'Uploading...' : 'Pilih File Gambar'}
                    </div>
                </div>
            </div>
        </div>

        {/* Baris 4: Image URL & Preview Mini */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center' }}>
            <div>
                <label style={labelStyle}>URL Gambar Utama</label>
                <input type="text" name="imageUrl" required style={compactInput} value={formData.imageUrl} onChange={handleChange} placeholder="https://..." />
            </div>
            {formData.imageUrl && (
                <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '12px' }}>
                    <img src={formData.imageUrl} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--primary)' }} />
                    {(() => {
                        try {
                            const gallery = JSON.parse(formData.images);
                            return gallery.filter((img: string) => img !== formData.imageUrl).slice(0, 2).map((img: string, i: number) => (
                                <img key={i} src={img} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                            ));
                        } catch(e) { return null; }
                    })()}
                </div>
            )}
        </div>

        {/* Baris 5: Deskripsi (Textarea lebih ramping) */}
        <div>
            <label style={labelStyle}>Deskripsi Produk</label>
            <textarea name="description" rows={3} style={{ ...compactInput, minHeight: '80px', resize: 'vertical' }} value={formData.description} onChange={handleChange} placeholder="Deskripsi..." />
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {formData.id ? 'Perbarui Produk' : 'Simpan Produk'}
            </button>
        </div>
      </form>
    </div>
  );
}
