import React, { useState, useEffect } from 'react';
import { WritingAnimation } from './WritingAnimation';
import { ContentLoadingSkeleton } from './ContentLoadingSkeleton';

interface ContentComparisonProps {
  originalContent: string;
  optimizedContent: string;
  sectionName: string;
  isLoading: boolean;
  onClose: () => void;
}

export const ContentComparison: React.FC<ContentComparisonProps> = ({
  originalContent,
  optimizedContent,
  sectionName,
  isLoading,
  onClose
}) => {
  const [showWritingAnimation, setShowWritingAnimation] = useState(false);

  // Automatically start writing animation when optimized content is received (only once)
  useEffect(() => {
    if (!isLoading && optimizedContent && !showWritingAnimation) {
      setShowWritingAnimation(true);
    }
  }, [isLoading, optimizedContent]); // Removed showWritingAnimation from dependencies

  return (
    <div className="content-comparison-card">
      <div className="card-header">
        <h3>Content Optimization - {sectionName}</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="card-content">
        <div className="content-columns">
          <div className="content-column">
            <h4>Original Content</h4>
            <div className="content-box original">
              <p>{originalContent}</p>
            </div>
          </div>
          <div className="content-column">
            <h4>Optimized Content</h4>
            <div className="content-box optimized">
              {isLoading ? (
                <ContentLoadingSkeleton sectionName={sectionName} />
              ) : showWritingAnimation ? (
                <WritingAnimation 
                  text={optimizedContent} 
                  speed={60}
                  onComplete={() => setShowWritingAnimation(false)}
                />
              ) : (
                <p>{optimizedContent}</p>
              )}
            </div>
            {!isLoading && !showWritingAnimation && (
              <button 
                className="replay-button"
                onClick={() => setShowWritingAnimation(true)}
              >
                Replay Animation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
