import React, { useState } from 'react';
import { useLanguage, getTranslation } from '../utils/translations';
import { getProfileKeyForSection } from '../utils/sectionDataMap';

interface GeneratedContentBoxProps {
  showGeneratedContent: boolean;
  isAnimating: boolean;
  generatedContentLoading: boolean;
  generatedContent: any;
  selectedSection: any;
  profile: any;
  onClose: () => void;
}

export const GeneratedContentBox: React.FC<GeneratedContentBoxProps> = ({
  showGeneratedContent,
  isAnimating,
  generatedContentLoading,
  generatedContent,
  selectedSection,
  profile,
  onClose
}) => {
  const currentLanguage = useLanguage();
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyContent = async () => {
    if (generatedContent?.improvedContent) {
      try {
        await navigator.clipboard.writeText(generatedContent.improvedContent);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000); // Hide after 2 seconds
      } catch (error) {
        console.error('Failed to copy content:', error);
      }
    }
  };

  if (!showGeneratedContent) return null;

  return (
    <div 
      style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        opacity: isAnimating ? 0 : 1,
        transform: isAnimating ? 'translateY(20px)' : 'translateY(0)',
        transition: 'opacity 0.4s ease, transform 0.4s ease'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        }}>
          {getTranslation(currentLanguage, 'generatedContent')}
        </h4>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#6b7280',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '16px'
      }}>
        {/* Original Content Box */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '12px'
        }}>
          <h5 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            {getTranslation(currentLanguage, 'originalContent')}
          </h5>
          <div style={{
            fontSize: '13px',
            color: '#6b7280',
            lineHeight: '1.4',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {(() => {
              const sectionTitle = selectedSection.title.toLowerCase();
              const profileKey = getProfileKeyForSection(sectionTitle);
              const originalData = profileKey ? profile[profileKey] : null;
              
              return originalData?.content || 'No content available for this section';
            })()}
          </div>
        </div>
        
        {/* AI Generated Content Box */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '12px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <h5 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              {getTranslation(currentLanguage, 'generatedContent')}
            </h5>
            {generatedContent?.improvedContent && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={handleCopyContent}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title={getTranslation(currentLanguage, 'copyToClipboard')}
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ color: '#6b7280' }}
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
                
                {/* Copied notification */}
                {showCopied && (
                  <div style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '0',
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    animation: 'fadeInOut 2s ease-in-out'
                  }}>
                    {getTranslation(currentLanguage, 'copied')}
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={{
            fontSize: '13px',
            color: '#6b7280',
            lineHeight: '1.4',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {generatedContentLoading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#6b7280'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid #e5e7eb',
                  borderTop: '2px solid #0B66C2',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                {getTranslation(currentLanguage, 'generatingContent')}
              </div>
            ) : generatedContent?.improvedContent ? (
              <div style={{
                fontSize: '13px',
                color: '#374151',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap'
              }}>
                {generatedContent.improvedContent}
              </div>
            ) : (
              <p>{getTranslation(currentLanguage, 'clickGenerateButton')}</p>
            )}
          </div>
        </div>
      </div>
      
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(5px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-5px); }
          }
        `}
      </style>
    </div>
  );
}; 