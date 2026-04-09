import prisma from "@/lib/prisma";
import Carousel from "@/components/Carousel";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";
import { ShoppingBag, ChevronRight, CheckCircle, Truck, ShieldCheck, Heart, Star, Share2 } from "lucide-react";
import Link from "next/link";
import CollapsibleDescription from "@/components/CollapsibleDescription";
import PurchaseButton from "@/components/PurchaseButton";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) }
  });

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.title} | caridisni`,
    description: product.description?.substring(0, 160) || "Dapatkan produk terbaik dengan harga spesial di caridisni.",
    openGraph: {
      title: product.title,
      description: product.description?.substring(0, 160),
      images: [product.imageUrl],
    },
  };
}

export default async function ProductDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) notFound();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true }
  });

  if (!product) notFound();

  // Fetch recommendations (same category, excluding current product)
  let recommendations = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id }
    },
    take: 4,
    include: { category: true }
  });

  // Fallback if no same-category recommendations found
  if (recommendations.length === 0) {
    recommendations = await prisma.product.findMany({
      where: { id: { not: product.id } },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    });
  }

  // Parse images
  let imageGallery: string[] = [];
  try {
    imageGallery = JSON.parse(product.images || "[]");
    if (imageGallery.length === 0 && product.imageUrl) {
      imageGallery = [product.imageUrl];
    }
  } catch (e) {
    imageGallery = [product.imageUrl];
  }

  return (
    <div style={{ backgroundColor: '#FBFCFE', minHeight: '100vh', paddingBottom: '120px', position: 'relative', overflowX: 'hidden' }}>
      {/* Decorative Top Background */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '460px', 
        background: 'linear-gradient(to bottom, #FFF1ED 0%, #FBFCFE 100%)', 
        zIndex: 0 
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '32px 24px' }}>
        {/* Breadcrumbs */}
        <nav style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '32px', 
          fontSize: '0.85rem', 
          color: '#64748b'
        }}>
          <Link href="/" style={{ color: 'inherit', fontWeight: '500' }}>Home</Link>
          <ChevronRight size={14} />
          {product.category && (
            <>
              <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.category.name}</span>
              <ChevronRight size={14} />
            </>
          )}
          <span style={{ color: '#0F172A', fontWeight: '650', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.title}
          </span>
        </nav>

        {/* Main Product Layout: 3 Columns on Large Screens */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 1.8fr 1fr', 
          gap: '40px',
          alignItems: 'start'
        }} className="product-main-grid">
          
          {/* Column 1: Gallery (Sticky) */}
          <div style={{ position: 'sticky', top: '100px' }} className="gallery-col">
            <div className="card" style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', borderRadius: '24px' }}>
              <Carousel images={imageGallery} title={product.title} />
            </div>
            {/* Gallery Labels */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', justifyContent: 'center', marginBottom: '24px' }}>
               <button style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                 <Share2 size={16} /> Bagikan
               </button>
               <button style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                 <Heart size={16} /> Simpan
               </button>
            </div>

            {/* Trust Badges - Moved here */}
            <div className="hide-mobile" style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '16px', 
              background: '#f8fafc', 
              padding: '20px', 
              borderRadius: '24px',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <ShieldCheck size={20} color="#0ea5e9" />
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: '800' }}>Original 100%</p>
                  <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Jaminan uang kembali</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Truck size={20} color="var(--primary)" />
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: '800' }}>Gratis Ongkir</p>
                  <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Ke seluruh Indonesia</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Content Area */}
          <div className="content-col" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              {/* Badges & Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                <span style={{ padding: '4px 10px', background: 'var(--primary)', color: 'white', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.5px' }}>OFFICIAL STORE</span>
                <span style={{ padding: '4px 10px', background: '#e0f2fe', color: '#0ea5e9', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800' }}>PILIHAN EDITOR</span>
              </div>

              <h1 style={{ 
                fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
                fontWeight: '900', 
                lineHeight: '1.2', 
                marginBottom: '16px', 
                color: '#0F172A',
                letterSpacing: '-0.04em'
              }}>
                {product.title}
              </h1>

              {/* Social Proof Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRight: '1px solid #e2e8f0', paddingRight: '20px' }}>
                  <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '1.25rem' }}>4.9</span>
                  <div style={{ display: 'flex', color: '#fbbf24' }}>
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                  </div>
                </div>
                <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '20px' }}>
                  <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '1.05rem' }}>1.2rb</span> <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Penilaian</span>
                </div>
                <div>
                   <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '1.05rem' }}>2.5rb+</span> <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Terjual</span>
                </div>
              </div>

              {/* Mobile/Tablet Price Block (Hidden on wide desktop) */}
              <div className="show-tablet-price" style={{ marginBottom: '40px', padding: '24px', background: 'white', border: '1px solid #f1f5f9', borderRadius: '20px' }}>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>Harga Terbaik:</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 'clamp(1.75rem, 5vw, 2.15rem)', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-1.5px', lineHeight: '1.1' }}>
                      Rp {product.price}
                    </span>
                    {product.originalPrice && (
                      <span style={{ fontSize: '1.1rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                        Rp {product.originalPrice}
                      </span>
                    )}
                  </div>
              </div>

              {/* Description Section */}
              <div style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '5px', height: '24px', background: 'var(--primary)', borderRadius: '10px' }}></div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>Spesifikasi & Deskripsi</h3>
                </div>
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <CollapsibleDescription content={product.description || ""} />
                </div>
              </div>

            </div>
          </div>

          {/* Column 3: Premium Action Panel (Sticky) */}
          <div style={{ position: 'sticky', top: '100px' }} className="buy-panel-col">
            <div className="card" style={{ 
              padding: '28px', 
              background: 'white', 
              border: '1px solid #f1f5f9',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)',
              borderRadius: '28px'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', color: '#0F172A' }}>Atur Pesanan</h3>
              
              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px', fontWeight: '600' }}>Harga Spesial:</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 'clamp(1.5rem, 3vw, 1.9rem)', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-1.5px', lineHeight: '1.1' }}>
                    Rp {product.price}
                  </span>
                  {product.originalPrice && (
                    <span style={{ fontSize: '1.1rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                      Rp {product.originalPrice}
                    </span>
                  )}
                </div>
                {product.originalPrice && (
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '900' }}>
                      HEMAT {Math.round((1 - (parseFloat(product.price.replace(/\D/g,'')) / parseFloat(product.originalPrice.replace(/\D/g,'')))) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <PurchaseButton productId={productId} url={product.shopeeUrl} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '50%' }}>
                      <CheckCircle size={16} color="#16a34a" />
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>Stok Ready Terbatas</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ padding: '8px', background: '#e0f2fe', borderRadius: '50%' }}>
                      <ShieldCheck size={16} color="#0ea5e9" />
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>Shopee Mall Vendor</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Seller Info */}
            <div className="card" style={{ marginTop: '24px', padding: '20px', border: 'none', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '14px', borderRadius: '24px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '16px', 
                  background: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: '900', 
                  color: 'var(--primary)', 
                  border: '2px solid var(--primary-light)',
                  fontSize: '1.2rem'
                }}>
                  {product.category?.name?.charAt(0) || 'C'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F172A' }}>{product.category?.name || 'CariDisni Official'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Balas Cepat (99%)</p>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <section style={{ marginTop: '120px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '48px' }}>
            <div>
              <p style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>PIKE OF THE MONTH</p>
              <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.05em' }}>Pilihan Serupa Untukmu</h2>
            </div>
            <Link href="/" className="hide-mobile" style={{ 
              color: 'var(--primary)', 
              fontWeight: '800', 
              fontSize: '0.95rem',
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '14px 28px',
              background: 'white',
              border: '2px solid var(--primary-light)',
              borderRadius: '50px',
              transition: 'all 0.3s ease'
            }}>
              Lihat Semua <ChevronRight size={20} />
            </Link>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '32px' 
          }}>
            {recommendations.map(item => (
              <ProductCard 
                key={item.id}
                id={item.id}
                title={item.title}
                description={item.description}
                imageUrl={item.imageUrl}
                price={item.price}
                originalPrice={item.originalPrice}
                shopeeUrl={item.shopeeUrl}
                categoryName={item.category?.name}
              />
            ))}
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1280px) {
          .product-main-grid {
            grid-template-columns: 1.5fr 2fr !important;
          }
          .buy-panel-col {
            display: none !important;
          }
          .show-tablet-price {
            display: block !important;
          }
        }
        @media (min-width: 1281px) {
          .show-tablet-price {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .product-main-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .gallery-col {
            position: relative !important;
            top: 0 !important;
          }
          .content-col {
            gap: 24px !important;
          }
        }
      `}} />

      {/* Mobile Fixed Buy Bar */}
      <div className="show-mobile fixed-bottom-bar" style={{ padding: '16px 20px', gap: '24px', alignItems: 'center' }}>
          <div style={{ flex: 1.2 }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', marginBottom: '2px' }}>Harga</p>
            <p style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.35rem)', fontWeight: '900', color: 'var(--primary)', lineHeight: '1.1' }}>Rp {product.price}</p>
          </div>
          <div style={{ flex: 1.5 }}>
            <PurchaseButton productId={productId} url={product.shopeeUrl} variant="compact" />
          </div>
      </div>
    </div>
  );
}
