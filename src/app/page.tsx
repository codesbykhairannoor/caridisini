import ProductCard from "@/components/ProductCard";
import ProductContainer from "@/components/ProductContainer";
import prisma from "@/lib/prisma";
import Image from "next/image";
import { Search, TrendingUp, Sparkles, Zap, ShieldCheck } from "lucide-react";

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

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <>
      <main style={{ minHeight: '100vh', position: 'relative' }}>
        <div className="mesh-bg"></div>

        {/* --- Premium Hero Section --- */}
        <section style={{ padding: '80px 0 120px', position: 'relative', overflow: 'hidden' }}>
          {/* Floating Decorative Badges */}
          <div className="hide-mobile animate-float" style={{ position: 'absolute', top: '15%', left: '10%', background: 'white', padding: '10px 20px', borderRadius: '50px', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1 }}>
            <Sparkles size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>Pilihan Editor</span>
          </div>
          <div className="hide-mobile animate-float" style={{ position: 'absolute', bottom: '20%', right: '12%', background: 'white', padding: '10px 20px', borderRadius: '50px', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1, animationDelay: '-2s' }}>
            <Zap size={16} color="#FFD700" />
            <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>Flash Sale Live</span>
          </div>

          <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            {/* Minimalist Logo Icon */}
            <div className="animate-breathe" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                <Image 
                  src="/logo_premium.png" 
                  alt="caridisini premium icon" 
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>

            <h1 className="animate-fade-up" style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: '900', lineHeight: '1.1', marginBottom: '24px' }}>
              Temukan Barang Impian <br /> 
              di <span className="text-gradient">CariDisini</span>
            </h1>

            <div className="animate-fade-up" style={{ maxWidth: '720px', margin: '48px auto 0' }}>
               <div style={{ 
                 position: 'relative',
                 background: 'white',
                 borderRadius: '100px',
                 padding: '8px',
                 boxShadow: '0 30px 60px -15px rgba(238, 77, 45, 0.2)',
                 display: 'flex',
                 alignItems: 'center',
                 border: '1px solid rgba(238, 77, 45, 0.1)'
               }}>
                 <div style={{ paddingLeft: '24px', marginRight: '8px' }}>
                   <Search size={22} color="var(--text-secondary)" />
                 </div>
                 <input 
                   type="text" 
                   placeholder="Cari barang berdiskon di Shopee..." 
                   style={{ 
                     border: 'none', 
                     padding: '16px 0', 
                     fontSize: '1.1rem', 
                     width: '100%', 
                     outline: 'none',
                     background: 'transparent'
                   }}
                 />
                 <button className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1rem' }}>
                   Cari Sekarang
                 </button>
               </div>

               {/* Trust Badges */}
               <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '32px', opacity: 0.7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                    <ShieldCheck size={14} /> Terverifikasi
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                    <Zap size={14} /> Update Harian
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* --- Product Grid Section with Filters --- */}
        <section id="produk" className="container" style={{ paddingBottom: '120px' }}>
          <ProductContainer initialProducts={products} categories={categories} />
        </section>

        {/* Minimalist Footer */}
        <footer style={{ padding: '60px 0', background: 'white', borderTop: '1px solid var(--border-color)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '24px', opacity: 0.5 }}>
               <Image src="/logo_premium.png" alt="logo footer" width={32} height={32} style={{ margin: '0 auto' }} />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
              &copy; {new Date().getFullYear()} CariDisni Premium Katalog. Built for Shopping Enthusiasts.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
