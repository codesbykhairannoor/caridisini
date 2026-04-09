'use client';

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleDescriptionProps {
  content: string;
}

export default function CollapsibleDescription({ content }: CollapsibleDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 300; // Number of characters to show initially

  if (!content) return null;

  const shouldCollapse = content.length > maxLength;
  const displayContent = isExpanded ? content : content.substring(0, maxLength);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ 
        color: 'var(--text-secondary)', 
        lineHeight: '1.8', 
        whiteSpace: 'pre-line',
        fontSize: '0.95rem',
        padding: '24px',
        background: '#f9fafb',
        borderRadius: '20px',
        transition: 'all 0.3s ease',
        maxHeight: isExpanded ? 'none' : '220px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {displayContent}
        {shouldCollapse && !isExpanded && (
          <div style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            height: '80px', 
            background: 'linear-gradient(transparent, #f9fafb)',
            pointerEvents: 'none'
          }}></div>
        )}
      </div>
      
      {shouldCollapse && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--primary)',
            fontWeight: '700',
            fontSize: '0.9rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px'
          }}
        >
          {isExpanded ? (
            <>Sembunyikan <ChevronUp size={16} /></>
          ) : (
            <>Baca Selengkapnya <ChevronDown size={16} /></>
          )}
        </button>
      )}
    </div>
  );
}
