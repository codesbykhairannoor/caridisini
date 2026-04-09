import prisma from "@/lib/prisma";
import { deleteProduct } from "../actions";
import ProductForm from "@/components/ProductForm";

export const revalidate = 0;

export default async function AdminPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Manajemen Produk</h1>
      </div>

      <ProductForm />


      {/* Product List Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-secondary)' }}>Produk</th>
              <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-secondary)' }}>Harga</th>
              <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-secondary)' }}>Kategori</th>
              <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Belum ada produk yang ditambahkan.
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img src={product.imageUrl} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                      <span style={{ fontWeight: '500' }}>{product.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>Rp {product.price}</td>
                  <td style={{ padding: '16px 24px' }}>
                    {product.category ? (
                       <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '0.875rem' }}>
                         {product.category.name}
                       </span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                     <form action={async () => {
                       'use server';
                       await deleteProduct(product.id);
                     }}>
                       <button type="submit" style={{ background: 'transparent', border: 'none', color: '#Ef4444', cursor: 'pointer', fontWeight: '600' }}>
                         Hapus
                       </button>
                     </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
