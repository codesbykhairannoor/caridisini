'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  images: string[];
  title: string;
}

export default function Carousel({ images, title }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Main Image Container */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        paddingTop: '100%', 
        borderRadius: 'var(--radius-lg)', 
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        backgroundColor: '#f8fafc'
      }}>
        <Image
          src={images[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(4px)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <ChevronLeft size={24} color="var(--primary)" />
            </button>
            <button
              onClick={nextSlide}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(4px)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <ChevronRight size={24} color="var(--primary)" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginTop: '16px', 
          overflowX: 'auto', 
          paddingBottom: '8px' 
        }}>
          {images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                position: 'relative',
                width: '60px',
                height: '60px',
                flexShrink: 0,
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: currentIndex === idx ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                opacity: currentIndex === idx ? 1 : 0.6,
                transition: 'all 0.2s'
              }}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
