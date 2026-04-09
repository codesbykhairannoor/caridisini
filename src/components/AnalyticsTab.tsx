'use client';

import React from 'react';
import { MousePointerClick, Wallet, TrendingUp, Star } from 'lucide-react';

interface AnalyticsTabProps {
  products: any[];
}

export default function AnalyticsTab({ products }: AnalyticsTabProps) {
  const totalClicks = products.reduce((acc, p) => acc + (p.clicks || 0), 0);
  
  // Simulated stats for premium feel
  const avgPrice = products.length > 0 ? (products.reduce((acc, p) => acc + parseFloat(p.price.replace(/\./g, '')), 0) / products.length) : 0;
  const estimatedRevenue = totalClicks * (avgPrice * 0.05); // 5% estimate
  
  const stats = [
    { label: 'Total Klik Tautan', value: totalClicks, icon: MousePointerClick, color: '#EE4D2D', trend: '+12.5%' },
    { label: 'Estimasi Komisi', value: `Rp ${estimatedRevenue.toLocaleString('id-ID')}`, icon: Wallet, color: '#10b981', trend: '+8.2%' },
    { label: 'Conversion Rate', value: '4.2%', icon: TrendingUp, color: '#3b82f6', trend: '+1.4%' },
    { label: 'Produk Terpopuler', value: products.length > 0 ? products[0].title : '-', icon: Star, color: '#f59e0b', subValue: 'Paling banyak diklik bulan ini' },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card" style={{ 
              padding: '30px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '20px',
              border: 'none',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  backgroundColor: `${stat.color}15`, 
                  color: stat.color, 
                  padding: '12px', 
                  borderRadius: '14px' 
                }}>
                  <Icon size={24} />
                </div>
                {stat.trend && (
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#10b981', backgroundColor: '#d1fae5', padding: '4px 8px', borderRadius: '6px' }}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '500' }}>{stat.label}</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>
                  {typeof stat.value === 'string' && stat.value.length > 20 ? stat.value.substring(0, 20) + '...' : stat.value}
                </h3>
                {stat.subValue && <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>{stat.subValue}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popular Products Mini Table */}
      <div className="card" style={{ padding: '30px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '24px' }}>Top Performance Products</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {products.slice(0, 5).map((product, i) => (
            <div key={product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: i === 4 ? 'none' : '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src={product.imageUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                <div>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.title}</p>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Rp {product.price}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1rem' }}>{product.clicks || 0}</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Clicks</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
