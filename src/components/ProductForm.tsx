'use client';

import { useState } from "react";
import { addProduct, scrapeProductData, uploadFile, generateAiOptimization, updateProduct } from "@/app/actions";
import { Sparkles, X, Link as LinkIcon, Save, Wand2, Loader2, UploadCloud, DollarSign, Tag, Type, CheckCircle2, AlertCircle } from "lucide-react";

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
        console.log(`[Client] Upload Sukses:`, result.url);
      }
    } catch (err) {
      console.error(`[Client] Upload Error`);
    } finally {
      setUploading(false);
    }
  };

  const handleFetchData = async () => {
    if (!formData.shopeeUrl) return;
    setLoading(true);
    setMessage(null);
    console.log(`[Client] 🔍 Memulai pencarian data...`);
    try {
      const result = await scrapeProductData(formData.shopeeUrl);
      console.log(`[Client] 📡 Server merespons:`, result);

      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          title: result.data.title || prev.title,
          description: result.data.description || prev.description,
          imageUrl: result.data.imageUrl || prev.imageUrl,
          images: result.data.images || prev.images,
          price: result.data.price || prev.price,
          categoryName: result.data.categoryName || prev.categoryName,
        }));
        setMessage({ text: "Berhasil mengambil data!", type: 'success' });
      } else {
        setMessage({ text: result.error || "Gagal mengambil data.", type: 'error' });
      }
    } catch (err) {
      setMessage({ text: "Error koneksi server.", type: 'error' });
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
        setMessage({ text: "AI Magic Optimized!", type: 'success' });
      }
    } catch (err) {
      setMessage({ text: "AI Error.", type: 'error' });
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
        setMessage({ text: "Berhasil diperbarui!", type: 'success' });
      } else {
        await addProduct(fd);
        setMessage({ text: "Produk tersimpan!", type: 'success' });
        setFormData({ id: null, title: "", description: "", categoryName: "", imageUrl: "", images: "[]", price: "", originalPrice: "", shopeeUrl: "" });
      }
      if (onSuccess) setTimeout(onSuccess, 1000);
    } catch (err) {
      setMessage({ text: "Gagal menyimpan.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' as const };
  const compactInput = { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', color: '#0f172a' };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{formData.id ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          {message && <div style={{ fontSize: '0.85rem', color: message.type === 'success' ? '#166534' : '#991b1b', fontWeight: '700' }}>{message.text}</div>}
          {onCancel && <button onClick={onCancel} style={{ background: '#f8fafc', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'flex-end' }}>
          <div>
            <label style={labelStyle}>Link Shopee Affiliate</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="url" name="shopeeUrl" required style={compactInput} value={formData.shopeeUrl} onChange={handleChange} placeholder="https://shope.ee/..." />
              <button type="button" onClick={handleFetchData} disabled={loading} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />} Cek Info
              </button>
            </div>
          </div>
          <button type="button" onClick={handleAiOptimize} disabled={aiLoading || !formData.title} style={{ height: '42px', padding: '0 16px', backgroundImage: 'linear-gradient(135deg, #EE4D2D, #FF8E53)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', opacity: (aiLoading || !formData.title) ? 0.6 : 1 }}><Sparkles size={16} /> AI Magic</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          <div><label style={labelStyle}>Nama Produk</label><input type="text" name="title" required style={compactInput} value={formData.title} onChange={handleChange} /></div>
          <div><label style={labelStyle}>Kategori</label><input type="text" name="categoryName" style={compactInput} value={formData.categoryName} onChange={handleChange} /></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '16px' }}>
          <div><label style={labelStyle}>Harga Diskon (Rp)</label><input type="text" name="price" required style={compactInput} value={formData.price} onChange={handleChange} /></div>
          <div><label style={labelStyle}>Harga Coret</label><input type="text" name="originalPrice" style={compactInput} value={formData.originalPrice} onChange={handleChange} /></div>
          <div><label style={labelStyle}>Upload Gambar</label><div style={{ position: 'relative' }}><input type="file" accept="image/*" onChange={handleFileUpload} style={{ position: 'absolute', inset:0, opacity:0, cursor:'pointer' }} /><div style={{ ...compactInput, borderStyle:'dashed', background:'#f8fafc', color:'#64748b' }}><UploadCloud size={16} /> {uploading ? 'Wait..' : 'Pilih File'}</div></div></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px' }}>
          <div><label style={labelStyle}>URL Gambar Utama</label><input type="text" name="imageUrl" required style={compactInput} value={formData.imageUrl} onChange={handleChange} /></div>
          {formData.imageUrl && <img src={formData.imageUrl} style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--primary)' }} alt="Preview" />}
        </div>

        <div><label style={labelStyle}>Deskripsi</label><textarea name="description" rows={3} style={{ ...compactInput, minHeight: '80px', resize: 'vertical' }} value={formData.description} onChange={handleChange} /></div>

        <button type="submit" disabled={loading} style={{ padding: '14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
          <Save size={18} /> {formData.id ? 'Perbarui Produk' : 'Simpan ke Katalog'}
        </button>
      </form>
    </div>
  );
}
