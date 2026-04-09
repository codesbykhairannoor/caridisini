import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import prisma from "@/lib/prisma";
import Image from "next/image";
import { Search, TrendingUp } from "lucide-react";

export const revalidate = 0;

export default async function Home() {
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
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Ultra-Minimalist Hero Section */}
        <section className="hero-white-orange" style={{ padding: '40px 0 60px' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <div className="animate-fade-up" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
              <Image 
                src="/logo.png" 
                alt="caridisini logo" 
                width={56} 
                height={56} 
                style={{ borderRadius: '14px', boxShadow: '0 8px 25px rgba(238, 77, 45, 0.15)' }}
              />
            </div>
            <h1 className="animate-fade-up" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: '850' }}>
              Temukan Barang Impian di <span className="text-gradient-orange">CariDisini</span>
            </h1>

            <div className="animate-fade-up" style={{ maxWidth: '680px', margin: '32px auto 0', position: 'relative' }}>
              <div style={{ 
                position: 'relative',
                background: 'white',
                borderRadius: '50px',
                padding: '6px',
                boxShadow: '0 25px 50px -12px rgba(238, 77, 45, 0.15)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{ padding: '0 16px' }}>
                  <Search size={20} color="var(--text-secondary)" />
                </div>
                <input 
                  type="text" 
                  placeholder="Cari barang berdiskon..." 
                  className="input-field"
                  style={{ border: 'none', padding: '12px 0', fontSize: '1rem', boxShadow: 'none', background: 'transparent' }}
                />
                <button className="btn btn-primary" style={{ borderRadius: '40px', padding: '12px 24px', fontSize: '0.9rem', fontWeight: '700' }}>
                  Cari
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid Section */}
        <section id="produk" className="container" style={{ paddingBottom: '100px', marginTop: '-20px', position: 'relative', zIndex: 10, flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: '800' }}>🔥 Penawaran Hari Ini</h2>
            </div>
            <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.875rem' }}>
              <TrendingUp size={18} />
              Terlaris
            </div>
          </div>

          {products.length > 0 ? (
            <div className="product-grid">
              {products.map(product => (
                <ProductCard 
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  description={product.description}
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
               <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontWeight: '700' }}>Belum ada produk</h3>
               <p style={{ color: 'var(--text-secondary)' }}>Cek kembali nanti!</p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer style={{ padding: '32px 0', textAlign: 'center', borderTop: '1px solid var(--border-color)', background: 'white' }}>
           <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              &copy; {new Date().getFullYear()} CariDisni. Semua hak cipta dilindungi.
           </p>
        </footer>
      </main>
    </>
  );
}
