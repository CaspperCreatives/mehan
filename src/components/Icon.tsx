import React, { useState, useEffect } from 'react';

interface IconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  alt?: string;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  className = '', 
  style = {}, 
  size = 24,
  alt = name 
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const loadSvg = async () => {
      try {
        // Normalize the icon name to match file naming convention
        const normalizedName = name.toLowerCase().replace(/\s+/g, '');
        
        // Try different path resolution strategies
        let svgPath = '';
        let pathStrategy = '';
        
        // Strategy 1: Chrome extension runtime URL (for popup/background)
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
          const chromeUrl = chrome.runtime.getURL(`icons/${normalizedName}.svg`);
          // Check if the URL is valid (not chrome-extension://invalid/)
          if (chromeUrl && !chromeUrl.includes('invalid')) {
            svgPath = chromeUrl;
            pathStrategy = 'chrome.runtime.getURL';
          } else {
            // Fallback to relative path if chrome URL is invalid
            svgPath = `/icons/${normalizedName}.svg`;
            pathStrategy = 'relative (chrome URL invalid)';
          }
        }
        // Strategy 2: Relative path from current location
        else if (typeof window !== 'undefined') {
          svgPath = `/icons/${normalizedName}.svg`;
          pathStrategy = 'relative';
        }
        // Strategy 3: Absolute path fallback
        else {
          svgPath = `/icons/${normalizedName}.svg`;
          pathStrategy = 'absolute';
        }
        
        // Convert relative paths to absolute URLs to prevent "Invalid URL" errors
        if (svgPath.startsWith('/') && typeof window !== 'undefined') {
          svgPath = new URL(svgPath, window.location.origin).href;
          pathStrategy += ' (converted to absolute)';
        } else if (!svgPath.startsWith('http://') && !svgPath.startsWith('https://') && !svgPath.startsWith('chrome-extension://') && typeof window !== 'undefined') {
          svgPath = new URL(svgPath, window.location.href).href;
          pathStrategy += ' (converted to absolute)';
        }
        
        console.log(`[Icon] Loading: "${name}" → "${normalizedName}.svg" using ${pathStrategy}: ${svgPath}`);
        
        const response = await fetch(svgPath);
        if (!response.ok) {
          throw new Error(`Failed to load icon: ${name} (${response.status}) from ${svgPath}`);
        }
        
        const svgText = await response.text();
        console.log(`[Icon] Successfully loaded: ${name}`);
        setSvgContent(svgText);
        setError(false);
      } catch (err) {
        console.warn(`[Icon] Failed to load: ${name}`, err);
        setError(true);
        setSvgContent('');
      }
    };

    if (name) {
      loadSvg();
    }
  }, [name]);

  if (error) {
    return (
      <div 
        className={`icon-placeholder ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: '#f3f4f6',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.6,
          color: '#9ca3af',
          ...style
        }}
        title={`Icon not found: ${name}`}
      >
        ?
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div 
        className={`icon-loading ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: '#f3f4f6',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
      >
        <div 
          style={{
            width: size * 0.4,
            height: size * 0.4,
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #6b7280',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`icon ${className}`}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      title={alt}
    />
  );
};

// Predefined icon names for better type safety
export const IconNames = {
  LINKEDIN_URL: 'linkedInUrl',
  HEADLINE: 'headline',
  PROJECTS: 'projects',
  EDUCATION: 'education',
  EXPERIENCES: 'experiences',
  SKILLS: 'skills',
  SUMMARY: 'summary',
  RECOMMENDATIONS: 'recommendations',
  COUNTRY: 'country',
  PROFILE_PIC: 'profilePic',
  BG_PIC: 'bgPic',
  FEATURED: 'featured',
  OTHERS: 'others'
} as const;

export type IconName = typeof IconNames[keyof typeof IconNames];

// Mapping function to convert section names to icon names
export const getIconNameFromSection = (sectionName: string): string => {
  const name = sectionName.toLowerCase();
  
  // Direct matches
  if (name === 'linkedinurl' || name === 'linkedin_url') return IconNames.LINKEDIN_URL;
  if (name === 'headline') return IconNames.HEADLINE;
  if (name === 'projects') return IconNames.PROJECTS;
  if (name === 'education') return IconNames.EDUCATION;
  if (name === 'experiences') return IconNames.EXPERIENCES;
  if (name === 'skills') return IconNames.SKILLS;
  if (name === 'summary') return IconNames.SUMMARY;
  if (name === 'recommendations') return IconNames.RECOMMENDATIONS;
  if (name === 'country') return IconNames.COUNTRY;
  if (name === 'profilepicture' || name === 'profile_picture') return IconNames.PROFILE_PIC;
  if (name === 'backgroundimage' || name === 'background_image') return IconNames.BG_PIC;
  if (name === 'featured') return IconNames.FEATURED;
  if (name === 'others') return IconNames.OTHERS;
  
  // Partial matches
  if (name.includes('linkedin') || name.includes('url')) return IconNames.LINKEDIN_URL;
  if (name.includes('headline')) return IconNames.HEADLINE;
  if (name.includes('project')) return IconNames.PROJECTS;
  if (name.includes('education') || name.includes('edu')) return IconNames.EDUCATION;
  if (name.includes('experience')) return IconNames.EXPERIENCES;
  if (name.includes('skill')) return IconNames.SKILLS;
  if (name.includes('summary')) return IconNames.SUMMARY;
  if (name.includes('recommendation')) return IconNames.RECOMMENDATIONS;
  if (name.includes('country')) return IconNames.COUNTRY;
  if (name.includes('profile')) return IconNames.PROFILE_PIC;
  if (name.includes('background') || name.includes('bg')) return IconNames.BG_PIC;
  if (name.includes('featured')) return IconNames.FEATURED;
  if (name.includes('other')) return IconNames.OTHERS;
  
  // Default fallback
  return IconNames.HEADLINE;
}; 