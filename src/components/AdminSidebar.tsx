'use client';

import React, { useState } from 'react';
import { LayoutDashboard, Package, PlusCircle, LogOut, ArrowLeft, Menu, X } from 'lucide-react';
import { logout } from '@/app/actions';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Produk Saya', icon: Package },
    { id: 'add', label: 'Tambah Baru', icon: PlusCircle },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Toggle Bar */}
      <div className="show-mobile" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'white',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        zIndex: 900,
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <button 
          onClick={() => setIsMobileOpen(true)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-primary)',
            padding: '8px',
            marginLeft: '-8px',
            cursor: 'pointer'
          }}
        >
          <Menu size={24} />
        </button>
        <div style={{ marginLeft: '12px', fontWeight: '800', color: 'var(--primary)', fontSize: '1.1rem' }}>
          Admin Panel
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="show-mobile"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000
          }}
        />
      )}

      {/* Main Sidebar (Desktop & Mobile Drawer) */}
      <aside 
        className={`${isMobileOpen ? 'admin-drawer flex-mobile' : 'hide-mobile'}`}
        style={{ 
          width: '280px', 
          backgroundColor: 'white', 
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: isMobileOpen ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          padding: '30px 20px',
          zIndex: 1001,
          boxShadow: isMobileOpen ? '20px 0 50px rgba(0,0,0,0.1)' : 'none'
        }}
      >
        {/* Close Button on Mobile Drawer */}
        <div className="show-mobile" style={{ position: 'absolute', top: '20px', right: '20px' }}>
           <button 
             onClick={() => setIsMobileOpen(false)}
             style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}
           >
             <X size={20} />
           </button>
        </div>

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
                onClick={() => handleTabClick(item.id)}
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
    </>
  );
}
