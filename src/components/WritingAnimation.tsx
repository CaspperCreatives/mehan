import React, { useState, useEffect, useRef } from 'react';

interface WritingAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const WritingAnimation: React.FC<WritingAnimationProps> = ({ 
  text, 
  speed = 60, 
  onComplete 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    // Handle undefined or empty text
    if (!text || text.trim() === '') {
      setDisplayedText('');
      setIsAnimating(false);
      return;
    }

    // Start new animation
    setIsAnimating(true);
    setDisplayedText('');
    
    let currentIndex = 0;
    
    animationRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
        setIsAnimating(false);
        onComplete?.();
      }
    }, speed);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [text, speed, onComplete]);

  return (
    <div className="writing-animation" style={{ 
      fontSize: 'inherit',
      fontWeight: 'inherit',
      color: 'inherit'
    }}>
      {displayedText || ''}
    </div>
  );
};
