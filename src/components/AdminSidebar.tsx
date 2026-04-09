'use client';

import React from 'react';
import { LayoutDashboard, Package, PlusCircle, LogOut, ArrowLeft } from 'lucide-react';
import { logout } from '@/app/actions';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Produk Saya', icon: Package },
    { id: 'add', label: 'Tambah Baru', icon: PlusCircle },
  ];

  return (
    <>
      {/* Vertical Sidebar - Hidden on Mobile */}
      <aside className="hide-mobile" style={{ 
        width: '280px', 
        backgroundColor: 'white', 
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        padding: '30px 20px'
      }}>
        <div style={{ marginBottom: '50px', padding: '0 10px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '4px' }}>Admin Panel</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Premium Dashboard v2.0</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(238, 77, 45, 0.08)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                className="sidebar-item"
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a 
            href="/"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '14px 20px', 
              color: 'var(--text-secondary)', 
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}
          >
            <ArrowLeft size={18} />
            Lihat Website
          </a>
          <button
            onClick={() => logout()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 20px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textAlign: 'left'
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Bottom Nav - Only on Mobile */}
      <nav className="mobile-bottom-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                flex: 1
              }}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: '0.7rem', fontWeight: isActive ? '700' : '500' }}>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => logout()}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: '#ef4444',
            flex: 1
          }}
        >
          <LogOut size={24} />
          <span style={{ fontSize: '0.7rem' }}>Logout</span>
        </button>
      </nav>
    </>
  );
}
