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
        {/* Clean Animated Hero Section */}
        <section className="hero-white-orange">
          {/* Animated Background Blobs */}
          <div className="blob" style={{ top: '-100px', right: '-100px', background: 'radial-gradient(circle, rgba(238, 77, 45, 0.15) 0%, transparent 70%)' }}></div>
          <div className="blob" style={{ bottom: '-150px', left: '-100px', background: 'radial-gradient(circle, rgba(255, 142, 83, 0.1) 0%, transparent 70%)', animationDelay: '-5s' }}></div>
          
          {/* Decorative Floating Elements */}
          <div style={{ position: 'absolute', top: '15%', right: '15%', animation: 'float 6s ease-in-out infinite', opacity: 0.1, color: 'var(--primary)' }}>
            <ShoppingBag size={100} />
          </div>
          <div style={{ position: 'absolute', bottom: '20%', left: '10%', animation: 'float 8s ease-in-out infinite', opacity: 0.08, animationDelay: '1s', color: 'var(--primary)' }}>
            <Sparkles size={120} />
          </div>

          <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div className="animate-fade-up" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'var(--primary-light)', 
              padding: '8px 20px', 
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: '700',
              marginBottom: '32px',
              color: 'var(--primary)',
              boxShadow: '0 4px 15px rgba(238, 77, 45, 0.1)'
            }}>
              <Sparkles size={16} />
              Platform Kurasi Affiliate Terpercaya
            </div>

            <h1 className="animate-fade-up" style={{ 
              fontSize: 'clamp(3rem, 7vw, 4.5rem)', 
              fontWeight: '850', 
              marginBottom: '24px',
              lineHeight: '1.1',
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              animationDelay: '0.1s'
            }}>
              Temukan Barang Impian <br /> 
              di <span className="text-gradient-orange">CariDisni</span>
            </h1>
            
            <p className="animate-fade-up" style={{ 
              fontSize: '1.25rem', 
              maxWidth: '650px',
              margin: '0 auto 48px',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
              fontWeight: '400',
              animationDelay: '0.2s'
            }}>
              Belanja cerdas dengan koleksi produk pilihan terbaik dan diskon paling menguntungkan dari Shopee, dikurasi khusus untuk Anda.
            </p>

            <div className="animate-fade-up" style={{ 
              maxWidth: '680px', 
              margin: '0 auto', 
              position: 'relative',
              animationDelay: '0.3s'
            }}>
              <div style={{ 
                position: 'relative',
                background: 'white',
                borderRadius: '50px',
                padding: '8px',
                boxShadow: '0 25px 50px -12px rgba(238, 77, 45, 0.15)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{ padding: '0 24px' }}>
                  <Search size={22} color="var(--text-secondary)" />
                </div>
                <input 
                  type="text" 
                  placeholder="Cari ribuan barang berdiskon di sini..." 
                  className="input-field"
                  style={{ 
                    border: 'none',
                    padding: '16px 0',
                    fontSize: '1.1rem',
                    boxShadow: 'none',
                    background: 'transparent'
                  }}
                />
                <button className="btn btn-primary" style={{
                  borderRadius: '40px',
                  padding: '16px 36px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  boxShadow: '0 10px 20px rgba(238, 77, 45, 0.2)'
                }}>
                  Cari Sekarang
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid Section */}
        <div style={{ marginTop: '40px', position: 'relative', zIndex: 10 }}>

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
                    id={product.id}
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
