import React, { useState, useEffect } from 'react';
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
              let originalData = null;
              
              if (profileKey && profile[profileKey]) {
                if (typeof profile[profileKey] === 'object' && profile[profileKey].content) {
                  // Original structure: { content: string }
                  originalData = profile[profileKey];
                } else if (Array.isArray(profile[profileKey])) {
                  // New structure: array of objects - format it nicely
                  const data = profile[profileKey];
                  if (sectionTitle === 'experiences' || sectionTitle === 'experience') {
                    // Format experience data
                    originalData = { 
                      content: data.map((exp: any, index: number) => 
                        `${index + 1}. ${exp.title || 'Unknown Position'}\n` +
                        `   Company: ${exp.company || 'Unknown Company'}\n` +
                        `   Role: ${exp.role || 'Unknown Role'}\n` +
                        `   Duration: ${exp.duration || 'Unknown Duration'}\n` +
                        `   Length: ${exp.length || 'Unknown Length'}\n` +
                        `   Description: ${exp.description || 'No description provided'}\n`
                      ).join('\n')
                    };
                  } else if (sectionTitle === 'education') {
                    // Format education data
                    originalData = { 
                      content: data.map((edu: any, index: number) => 
                        `${index + 1}. ${edu.school || 'Unknown School'}\n` +
                        `   Degree: ${edu.degree || 'Unknown Degree'}\n` +
                        `   Field: ${edu.field || 'Unknown Field'}\n` +
                        `   Duration: ${edu.duration || 'Unknown Duration'}\n`
                      ).join('\n')
                    };
                  } else if (sectionTitle === 'skills') {
                    // Format skills data
                    originalData = { 
                      content: data.map((skill: any, index: number) => 
                        `${index + 1}. ${skill.name || 'Unknown Skill'} (${skill.endorsements || 0} endorsements)`
                      ).join('\n')
                    };
                  } else if (sectionTitle === 'projects') {
                    // Format projects data
                    originalData = { 
                      content: data.map((project: any, index: number) => 
                        `${index + 1}. ${project.title || 'Unknown Project'}\n` +
                        `   Description: ${project.description || 'No description provided'}\n` +
                        `   URL: ${project.url || 'No URL provided'}\n`
                      ).join('\n')
                    };
                  } else if (sectionTitle === 'recommendations') {
                    // Format recommendations data
                    originalData = { 
                      content: data.map((rec: any, index: number) => 
                        `${index + 1}. ${rec.name || 'Unknown Person'}\n` +
                        `   Title: ${rec.title || 'Unknown Title'}\n` +
                        `   Company: ${rec.company || 'Unknown Company'}\n` +
                        `   Content: ${rec.content || 'No content provided'}\n`
                      ).join('\n')
                    };
                  } else if (sectionTitle === 'publications') {
                    // Format publications data
                    originalData = { 
                      content: data.map((pub: any, index: number) => 
                        `${index + 1}. ${pub.title || 'Unknown Publication'}\n` +
                        `   Description: ${pub.description || 'No description provided'}\n` +
                        `   URL: ${pub.url || 'No URL provided'}\n`
                      ).join('\n')
                    };
                  } else if (sectionTitle === 'certifications' || sectionTitle === 'certificates') {
                    // Format certifications data
                    originalData = { 
                      content: data.map((cert: any, index: number) => 
                        `${index + 1}. ${cert.name || 'Unknown Certification'}\n` +
                        `   Issuer: ${cert.issuer || 'Unknown Issuer'}\n` +
                        `   Date: ${cert.date || 'Unknown Date'}\n`
                      ).join('\n')
                    };
                  } else if (sectionTitle === 'languages') {
                    // Format languages data
                    originalData = { 
                      content: data.map((lang: any, index: number) => 
                        `${index + 1}. ${lang.name || 'Unknown Language'} (${lang.proficiency || 'Unknown Proficiency'})`
                      ).join('\n')
                    };
                  } else if (sectionTitle === 'volunteering') {
                    // Format volunteering data
                    originalData = { 
                      content: data.map((vol: any, index: number) => 
                        `${index + 1}. ${vol.title || 'Unknown Position'}\n` +
                        `   Organization: ${vol.organization || 'Unknown Organization'}\n` +
                        `   Description: ${vol.description || 'No description provided'}\n` +
                        `   Duration: ${vol.duration || 'Unknown Duration'}\n`
                      ).join('\n')
                    };
                  } else if (sectionTitle === 'honorsawards') {
                    // Format honors and awards data
                    originalData = { 
                      content: data.map((award: any, index: number) => 
                        `${index + 1}. ${award.title || 'Unknown Award'}\n` +
                        `   Description: ${award.description || 'No description provided'}\n` +
                        `   Date: ${award.date || 'Unknown Date'}\n`
                      ).join('\n')
                    };
                  } else {
                    // Fallback for other array data
                    originalData = { content: JSON.stringify(profile[profileKey], null, 2) };
                  }
                } else {
                  // Fallback
                  originalData = { content: String(profile[profileKey]) };
                }
              }
              
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
              <SkeletonLoader />
            ) : generatedContent?.improvedContent ? (
              <StreamingText text={generatedContent.improvedContent} speed={20} />
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
          
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}; 

// Streaming text component
const StreamingText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <div style={{
      fontSize: '13px',
      color: '#374151',
      lineHeight: '1.5',
      whiteSpace: 'pre-wrap'
    }}>
      {displayedText}
      {currentIndex < text.length && (
        <span style={{
          display: 'inline-block',
          width: '2px',
          height: '16px',
          backgroundColor: '#0B66C2',
          marginLeft: '2px',
          animation: 'blink 1s infinite'
        }}></span>
      )}
    </div>
  );
}; 

// Skeleton loading component
const SkeletonLoader: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      {/* First line - longer */}
      <div style={{
        height: '12px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        width: '85%',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}></div>
      
      {/* Second line - medium */}
      <div style={{
        height: '12px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        width: '70%',
        animation: 'pulse 1.5s ease-in-out infinite',
        animationDelay: '0.2s'
      }}></div>
      
      {/* Third line - shorter */}
      <div style={{
        height: '12px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        width: '60%',
        animation: 'pulse 1.5s ease-in-out infinite',
        animationDelay: '0.4s'
      }}></div>
      
      {/* Fourth line - longer */}
      <div style={{
        height: '12px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        width: '80%',
        animation: 'pulse 1.5s ease-in-out infinite',
        animationDelay: '0.6s'
      }}></div>
      
      {/* Fifth line - medium */}
      <div style={{
        height: '12px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        width: '65%',
        animation: 'pulse 1.5s ease-in-out infinite',
        animationDelay: '0.8s'
      }}></div>
      
      {/* Sixth line - shorter */}
      <div style={{
        height: '12px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        width: '45%',
        animation: 'pulse 1.5s ease-in-out infinite',
        animationDelay: '1s'
      }}></div>
    </div>
  );
}; 