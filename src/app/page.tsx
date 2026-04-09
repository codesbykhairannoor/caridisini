import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import prisma from "@/lib/prisma";
import { Search, ShoppingBag, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function Home() {
  const categories = await prisma.category.findMany();
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <>
      <Header />
      <main>
        {/* Full-width Animated Hero Section */}
        <section className="hero-gradient" style={{ 
          position: 'relative',
          padding: '120px 0 160px',
          color: 'white',
          overflow: 'hidden'
        }}>
          {/* Decorative Floating Elements */}
          <div style={{ position: 'absolute', top: '10%', right: '10%', animation: 'float 6s ease-in-out infinite', opacity: 0.2 }}>
            <ShoppingBag size={120} />
          </div>
          <div style={{ position: 'absolute', bottom: '15%', left: '5%', animation: 'float 8s ease-in-out infinite', opacity: 0.15, animationDelay: '1s' }}>
            <Sparkles size={80} />
          </div>
          <div style={{ position: 'absolute', top: '20%', left: '15%', animation: 'float 7s ease-in-out infinite', opacity: 0.1, animationDelay: '-1.5s' }}>
            <TrendingUp size={60} />
          </div>

          <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(255,255,255,0.15)', 
              backdropFilter: 'blur(10px)',
              padding: '8px 16px', 
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '32px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Sparkles size={16} />
              Platform Kurasi Affiliate Terpercaya
            </div>

            <h1 className="text-gradient" style={{ 
              fontSize: 'clamp(3rem, 8vw, 5rem)', 
              fontWeight: '800', 
              marginBottom: '24px',
              lineHeight: '1.1',
              letterSpacing: '-2px'
            }}>
              Cari Barang Impian <br /> 
              Mulai <span style={{ textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.4)', textUnderlineOffset: '12px' }}>CariDisni</span>
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem', 
              maxWidth: '700px',
              margin: '0 auto 48px',
              lineHeight: '1.6',
              opacity: 0.9,
              fontWeight: '400'
            }}>
              Dapatkan produk-produk pilihan terbaik dengan promo diskon gila-gilaan dari Shopee. Semua dalam satu genggaman di caridisni.
            </p>

            <div style={{ 
              maxWidth: '650px', 
              margin: '0 auto', 
              position: 'relative',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))'
            }}>
              <div style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                <Search size={24} color="var(--text-secondary)" />
              </div>
              <input 
                type="text" 
                placeholder="Cari ribuan barang berdiskon di sini..." 
                className="input-field"
                style={{ 
                  background: 'white', 
                  padding: '24px 24px 24px 64px', 
                  fontSize: '1.15rem',
                  borderRadius: '40px',
                  border: 'none',
                  color: '#000'
                }}
              />
              <button className="btn btn-primary" style={{
                position: 'absolute',
                right: '10px',
                top: '10px',
                bottom: '10px',
                borderRadius: '32px',
                padding: '0 32px',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(238, 77, 45, 0.4)'
              }}>
                Cari Sekarang
              </button>
            </div>
          </div>
        </section>

        {/* Improved Categories & Product List Container */}
        <div style={{ marginTop: '-60px', position: 'relative', zIndex: 10 }}>
          {/* Categories Section */}
          <section id="kategori" className="container">
            <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', overflowX: 'auto', marginBottom: '40px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
              <button className="btn btn-primary" style={{ borderRadius: '30px', whiteSpace: 'nowrap' }}>Semua Produk</button>
              {categories.map(cat => (
                <button key={cat.id} className="btn" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', whiteSpace: 'nowrap', borderRadius: '30px' }}>
                  {cat.name}
                </button>
              ))}
            </div>
          </section>

          {/* Product Grid Section */}
          <section className="container" style={{ paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>🔥 Penawaran Hari Ini</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Produk terkurasi dengan harga terendah</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.875rem' }}>
                <TrendingUp size={18} />
                Terlaris Minggu Ini
              </div>
            </div>

            {products.length > 0 ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '32px' 
              }}>
                {products.map(product => (
                  <ProductCard 
                    key={product.id}
                    title={product.title}
                    imageUrl={product.imageUrl}
                    originalPrice={product.originalPrice}
                    price={product.price}
                    shopeeUrl={product.shopeeUrl}
                    categoryName={product.category?.name}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                 <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                   <ShoppingBag size={32} />
                 </div>
                 <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontWeight: '700' }}>Belum ada produk</h3>
                 <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Cek kembali nanti atau login sebagai admin untuk menambah barang.</p>
                 <Link href="/login" className="btn" style={{ border: '1px solid var(--border-color)' }}>Login Admin</Link>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
