import { useState, useEffect } from 'react';
import { aiAnalyzer } from '../aiAnalyzer';
import { AIAnalysisResult } from '../aiAnalyzer';

interface BasicInfo {
  name: string;
  headline: string;
  location: string;
  profileImage: string;
  backgroundImage: string;
  profileImageTitle: string;
}

interface LinkedInProfile {
  basicInfo: BasicInfo;
  about: any;
  skills: any;
  experience: any;
  education: any;
  certifications: any;
  projects: any;
  languages: any;
  volunteering: any;
  featured: any;
  activity: any;
  recommendations: any;
  publications: any;
  courses: any;
  honorsAwards: any;
  causes: any;
  accomplishments: any;
  headline: any;
  patents: any; // NEW
  testScores: any; // NEW
  organizations: any; // NEW
  contactInfo: any; // NEW
}

export const useLinkedInProfile = () => {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const scrapeProfile = async (forceRefresh: boolean = false) => {
    try {
      // Wait for the page to be fully loaded
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract custom URL from current URL
      const extractCustomUrl = (): string => {
        const currentUrl = window.location.href;
        const linkedInUrlMatch = currentUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
        if (linkedInUrlMatch && linkedInUrlMatch[1]) {
          const customUrl = linkedInUrlMatch[1];
          // Check if it's a custom URL (not a numeric ID)
          if (!/^\d+$/.test(customUrl)) {
            return customUrl;
          }
        }
        return '';
      };

      const customUrl = extractCustomUrl();

      console.log('Extracted custom URL:', customUrl);

      // Create a separate document for isolated scraping
      const parser = new DOMParser();
      const doc = parser.parseFromString(document.documentElement.outerHTML, 'text/html');

      // Extract structured metadata from ld+json
      const ldJsonScripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
      const ldJsonData = ldJsonScripts
        .map(script => {
          try {
            return JSON.parse(script.textContent || '{}');
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);

      // Extract OpenGraph metadata
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
      const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';

      // Extract basic info from the main profile section
      const mainProfileSection = document.querySelector('main');

      const basicInfo: BasicInfo = {
        name: mainProfileSection?.querySelector('h1')?.textContent?.trim() || 
              ldJsonData[0]?.name || 
              ogTitle.split(' | ')[0] || '',
        headline: mainProfileSection?.querySelector('div[class*="text-body-medium"]')?.textContent?.trim() || 
                 ldJsonData[0]?.description || 
                 ogDescription || '',
        location: mainProfileSection?.querySelector('span[class*="text-body-small"]')?.textContent?.trim() || 
                 ldJsonData[0]?.address?.addressLocality || '',
        profileImage: document.querySelector('img[class*="pv-top-card-profile-picture__image--show"]')?.getAttribute('src') || 
                     ldJsonData[0]?.image || '',
      profileImageTitle: document.querySelector('img[class*="pv-top-card-profile-picture__image--show"]')?.getAttribute('title') || '',

      backgroundImage: document.querySelector('img[class*="profile-background-image__image"]')?.getAttribute('src') || '',
      };


      const sections = Array.from(document.querySelectorAll('section'));

      const result = sections.reduce((acc: any, sec, idx) => {
        const key = sec.id || `section-${idx}`;
        const fullText = sec.innerText.trim();
        const title = fullText.split('\n')[0].trim();

        acc[key] = {
          section: sec,
          innerText: [ ... new Set(fullText?.split('\n'))].join('\n'),
          title: title
        };
        return acc;
      }, {});

      let profileData = {
          basicInfo,
          about: null as any,
          skills: null as any,
          experience: null as any,
          education: null as any,
          certifications: null as any,
          projects: null as any,
          languages: null as any,
          volunteering: null as any,
          featured: null as any,
          activity: null as any,
          recommendations: null as any,
          publications: null as any,
          courses: null as any,
          honorsAwards: null as any,
          causes: null as any,
          accomplishments: null as any,
          headline: null as any,
          customUrl: customUrl,
          patents: null as any, // NEW
          testScores: null as any, // NEW
          organizations: null as any, // NEW
          contactInfo: null as any, // NEW
        };

        Object.values(result).forEach((item: any) => {
          if(item.title === 'About' || item.title === 'نبذة عنا') {
              let className = 'about-section'
              item.section.classList.add(className)
              profileData.about = {content: item.innerText, className: className, title: 'about'}
          }

          if(item.title === 'Top skills' || item.title === 'أبرز المهارات') {
              let className = 'skills-section'
              item.section.classList.add(className)
              profileData.skills = {content: item.innerText, className: className, title: 'top-skills'}
          }
  
          if(item.title === 'Experience' || item.title === 'الخبرة') {
              let className = 'experience-section'
              item.section.classList.add(className)
              profileData.experience = {content: item.innerText, className: className, title: 'experience'}
          }
  
          if(item.title === 'Education' || item.title === 'التعليم') {
              let className = 'education-section'
              item.section.classList.add(className)
              profileData.education = {content: item.innerText, className: className, title: 'education'}
          }
  
          if(item.title === 'Certifications' || item.title === 'الشهادات') {
              let className = 'certifications-section'
              item.section.classList.add(className)
              profileData.certifications = {content: item.innerText, className: className, title: 'certifications'}
          }
  
          if(item.title === 'Projects' || item.title === 'المشاريع') {
              let className = 'projects-section'
              item.section.classList.add(className)
              profileData.projects = {content: item.innerText, className: className, title: 'projects'}
          }
  
          if(item.title === 'Languages' || item.title === 'اللغات') {
              let className = 'languages-section'
              item.section.classList.add(className)
              profileData.languages = {content: item.innerText, className: className, title: 'languages'}
          }
  
          if(item.title === 'Volunteering' || item.title === 'التطوع') {
              let className = 'volunteering-section'
              item.section.classList.add(className)
              profileData.volunteering = {content: item.innerText, className: className, title: 'volunteering'}
          }
  
          if(item.title === 'Accomplishments' || item.title === 'الإنجازات') {
              let className = 'accomplishments-section'
              item.section.classList.add(className)
              profileData.accomplishments = {content: item.innerText, className: className, title: 'accomplishments'}
          }
          if(item.title === 'Featured' || item.title === 'المميز') {
              let className = 'featured-section'
              item.section.classList.add(className)
              profileData.featured = {content: item.innerText, className: className, title: 'featured'}
          }
          if(item.title === 'Activity' || item.title === 'النشاط') {
              let className = 'activity-section'
              item.section.classList.add(className)
              profileData.activity = {content: item.innerText, className: className, title: 'activity'}
          }
          if(item.title === 'Skills' || item.title === 'المهارات') {
              let className = 'skills-section'
              item.section.classList.add(className)
              profileData.skills = {content: item.innerText, className: className, title: 'skills'}
          }
          if(item.title === 'Recommendations' || item.title === 'التوصيات') {
              let className = 'recommendations-section'
              item.section.classList.add(className)
              profileData.recommendations = {content: item.innerText, className: className, title: 'recommendations'}
          }
          if(item.title === 'Publications' || item.title === 'المنشورات') {
              let className = 'publications-section'
              item.section.classList.add(className)
              profileData.publications = {content: item.innerText, className: className, title: 'publications'}
          }
          if(item.title === 'Courses' || item.title === 'الدورات الدراسية') {
              let className = 'courses-section'
              item.section.classList.add(className)
              profileData.courses = {content: item.innerText, className: className, title: 'courses'}
          }
          if(item.title === 'Honors & awards' || item.title === 'تكريمات ومكافآت') {
              let className = 'honors-awards-section'
              item.section.classList.add(className)
              profileData.honorsAwards = {content: item.innerText, className: className, title: 'honors-awards'}
          }
          if(item.title === 'Causes' || item.title === 'القضايا التطوعية') {
              let className = 'causes-section'
              item.section.classList.add(className)
              profileData.causes = {content: item.innerText, className: className, title: 'causes'}
          }
          if(item.title === 'Patents' || item.title === 'براءات الاختراع') {
              let className = 'patents-section'
              item.section.classList.add(className)
              profileData.patents = {content: item.innerText, className: className, title: 'patents'}
          }
          if(item.title === 'Test scores' || item.title === 'درجات الاختبار') {
              let className = 'test-scores-section'
              item.section.classList.add(className)
              profileData.testScores = {content: item.innerText, className: className, title: 'test-scores'}
          }
          if(item.title === 'Organizations' || item.title === 'المنظمات') {
              let className = 'organizations-section'
              item.section.classList.add(className)
              profileData.organizations = {content: item.innerText, className: className, title: 'organizations'}
          }
          if(item.title === 'Contact info' || item.title === 'معلومات الاتصال') {
              let className = 'contact-info-section'
              item.section.classList.add(className)
              profileData.contactInfo = {content: item.innerText, className: className, title: 'contact-info'}
          }
        })
        
        profileData.headline = result['section-2'].innerText
        console.log('profileData', profileData);

        // Set the profile data first
        console.log('user linkedin profileData', profileData);
        setProfile(profileData);
        
        // Perform AI analysis
        setAiLoading(true);
        setAiError(null);
        try {
          const aiResult = await aiAnalyzer.analyzeProfile(profileData, 0, forceRefresh);
          setAiAnalysis(aiResult);
        } catch (err) {
          setAiError('Failed to perform AI analysis');
          console.error('AI analysis error:', err);
        } finally {
          setAiLoading(false);
        }
    
    } catch (err) {
      console.error('Error scraping profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while scraping the profile');
    } finally {
      setLoading(false);
    }
  };

  // Refresh function that can be called externally
  const refreshProfileData = async () => {
    setLoading(true);
    setError(null);
    await scrapeProfile(true); // Force refresh
  };

  useEffect(() => {
    scrapeProfile();
  }, []);

  return { 
    profile, 
    loading, 
    error, 
    aiAnalysis, 
    aiLoading, 
    aiError,
    refreshProfileData
  };
};
