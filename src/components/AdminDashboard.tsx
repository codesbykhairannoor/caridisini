'use client';

import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AnalyticsTab from './AnalyticsTab';
import ProductsTab from './ProductsTab';
import AddProductTab from './AddProductTab';

interface AdminDashboardProps {
  products: any[];
  categories: any[];
}

export default function AdminDashboard({ products, categories }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setActiveTab('add');
  };

  const handleFinishEdit = () => {
    setEditingProduct(null);
    setActiveTab('products');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AnalyticsTab products={products} />;
      case 'products':
        return <ProductsTab products={products} onEdit={handleEdit} />;
      case 'add':
        return (
          <AddProductTab 
            initialData={editingProduct} 
            onSuccess={handleFinishEdit}
            onCancel={() => {
              setEditingProduct(null);
              setActiveTab('products');
            }}
          />
        );
      default:
        return <AnalyticsTab products={products} />;
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      overflowX: 'hidden'
    }}>
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main style={{ 
        flexGrow: 1, 
        width: '100%',
        padding: 'clamp(16px, 5vw, 40px)',
        paddingBottom: '100px' // Space for mobile bottom nav
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <header style={{ marginBottom: 'clamp(20px, 6vw, 40px)' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', color: '#111827' }}>
              {activeTab === 'overview' && 'Selamat Datang, Admin! 👋'}
              {activeTab === 'products' && 'Manajemen Produk'}
              {activeTab === 'add' && 'Input Produk Baru'}
            </h1>
            <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '0.9rem' }}>
              {activeTab === 'overview' && 'Berikut adalah performa etalase Anda hari ini.'}
              {activeTab === 'products' && 'Kelola katalog Shopee Affiliate Anda di sini.'}
              {activeTab === 'add' && 'Gunakan AI untuk optimasi deskripsi otomatis.'}
            </p>
          </header>

          <div className="tab-content-wrapper animate-fade-in">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
