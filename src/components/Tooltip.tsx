import React, { useState } from 'react';
import { useLanguage } from '../utils/translations';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({ children, text, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { language: currentLanguage } = useLanguage();
  const isRTL = currentLanguage === 'ar';

  const getTooltipStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '6px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      whiteSpace: 'nowrap' as const,
      zIndex: 9999999,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      border: '1px solid #374151'
    };

    switch (position) {
      case 'left':
        return {
          ...baseStyle,
          right: isRTL ? 'auto' : '100%',
          left: isRTL ? '100%' : 'auto',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: isRTL ? '0' : '5px',
          marginLeft: isRTL ? '5px' : '0'
        };
      case 'right':
        return {
          ...baseStyle,
          left: isRTL ? 'auto' : '100%',
          right: isRTL ? '100%' : 'auto',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: isRTL ? '0' : '5px',
          marginRight: isRTL ? '5px' : '0'
        };
      case 'bottom':
        return {
          ...baseStyle,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '5px'
        };
      default: // top
        return {
          ...baseStyle,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '5px'
        };
    }
  };

  const getArrowStyle = () => {
    const baseArrowStyle = {
      position: 'absolute' as const,
      border: '4px solid transparent'
    };

    switch (position) {
      case 'left':
        return {
          ...baseArrowStyle,
          left: isRTL ? 'auto' : '100%',
          right: isRTL ? '100%' : 'auto',
          top: '50%',
          transform: 'translateY(-50%)',
          borderRightColor: isRTL ? 'transparent' : '#1f2937',
          borderLeftColor: isRTL ? '#1f2937' : 'transparent'
        };
      case 'right':
        return {
          ...baseArrowStyle,
          right: isRTL ? 'auto' : '100%',
          left: isRTL ? '100%' : 'auto',
          top: '50%',
          transform: 'translateY(-50%)',
          borderLeftColor: isRTL ? 'transparent' : '#1f2937',
          borderRightColor: isRTL ? '#1f2937' : 'transparent'
        };
      case 'bottom':
        return {
          ...baseArrowStyle,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderTopColor: '#1f2937'
        };
      default: // top
        return {
          ...baseArrowStyle,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderBottomColor: '#1f2937'
        };
    }
  };

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div style={getTooltipStyle()}>
          {text}
          <div style={getArrowStyle()}></div>
        </div>
      )}
    </div>
  );
}; 