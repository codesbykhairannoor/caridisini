import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import prisma from "@/lib/prisma";
import { Search, ShoppingBag, Filter } from "lucide-react";

export const revalidate = 0;

export default async function ProductsPage() {
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
      <main style={{ minHeight: '80vh', background: 'var(--bg-color)' }}>
        {/* Subtle Page Header */}
        <section style={{ 
          padding: '60px 0 40px', 
          background: 'white', 
          borderBottom: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div className="container">
            <h1 style={{ fontSize: '2.5rem', fontWeight: '850', marginBottom: '12px' }}>Semua Produk</h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 32px' }}>
              Temukan seluruh koleksi produk pilihan terbaik yang telah dikurasi khusus untuk Anda.
            </p>

            {/* Compact Search Bar */}
            <div style={{ 
              maxWidth: '600px', 
              margin: '0 auto',
              position: 'relative'
            }}>
              <div style={{ 
                background: 'var(--bg-color)',
                borderRadius: '12px',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ padding: '0 16px' }}>
                  <Search size={18} color="var(--text-secondary)" />
                </div>
                <input 
                  type="text" 
                  placeholder="Cari produk..." 
                  style={{ 
                    border: 'none',
                    padding: '12px 0',
                    fontSize: '1rem',
                    background: 'transparent',
                    width: '100%',
                    outline: 'none'
                  }}
                />
                <button className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
                  Cari
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Product Listing Section */}
        <section className="container" style={{ padding: '60px 0 100px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '32px' 
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              Menampilkan {products.length} Produk
            </h2>
            <button style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '0.875rem', 
              fontWeight: '600',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'white',
              cursor: 'pointer'
            }}>
              <Filter size={16} />
              Filter
            </button>
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
            <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
               <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                 <ShoppingBag size={32} />
               </div>
               <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontWeight: '700' }}>Belum ada produk</h3>
               <p style={{ color: 'var(--text-secondary)' }}>Koleksi produk akan segera kami update!</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
