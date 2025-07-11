export interface ProfileData {
  name: string;
  headline: string;
  currentPosition: string;
  hasProfilePhoto: boolean;
  summary: string;
  customUrl: string;
  recentActivityCount: number;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    duration: string;
  }>;
  skills: Array<{
    name: string;
    endorsements: number;
  }>;
  connections: number;
  recommendations: number;
  country: string;
  backgroundImage?: string;
}

export const extractProfileData = async (): Promise<ProfileData> => {
  // Wait for the profile content to load
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Robust extraction for name
  const name = (() => {
    const h1s = Array.from(document.querySelectorAll('section h1, main h1'));
    return h1s.length ? h1s[0].textContent?.trim() || '' : '';
  })();

  // Robust extraction for headline
  const headline = (() => {
    const h1 = document.querySelector('section h1, main h1');
    if (h1) {
      let el = h1.parentElement;
      while (el && el !== document.body) {
        const headlineDiv = Array.from(el.querySelectorAll('div')).find(div => div.textContent && div.textContent.length > 0 && div !== h1);
        if (headlineDiv && headlineDiv.textContent) return headlineDiv.textContent.trim();
        el = el.parentElement;
      }
    }
    const divs = Array.from(document.querySelectorAll('div'));
    const candidate = divs.find(div => div.textContent && div.textContent.length > 30);
    return candidate && candidate.textContent ? candidate.textContent.trim() : '';
  })();

  // Check for profile photo
  const hasProfilePhoto = (() => {
    const photoElement = document.querySelector('.pv-top-card-profile-picture__image, .profile-photo-edit__preview');
    return !!photoElement;
  })();

  // Extract summary/about section
  const summary = (() => {
    const aboutSection = Array.from(document.querySelectorAll('section')).find(sec => 
      sec.textContent && /about/i.test(sec.textContent)
    );
    if (aboutSection) {
      const summaryText = aboutSection.querySelector('div')?.textContent?.trim();
      return summaryText || '';
    }
    return '';
  })();

  // Extract custom URL
  const customUrl = (() => {
    // First try to extract from the current URL
    const currentUrl = window.location.href;
    const linkedInUrlMatch = currentUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
    if (linkedInUrlMatch && linkedInUrlMatch[1]) {
      const urlFromPath = linkedInUrlMatch[1];
      // Check if it's a custom URL (not a numeric ID)
      if (!/^\d+$/.test(urlFromPath)) {
        console.log('Custom URL extracted from path:', urlFromPath);
        return urlFromPath;
      }
    }
    
    // Fallback to DOM extraction
    const urlElement = document.querySelector('.pv-top-card--list-bullet a');
    const href = urlElement?.getAttribute('href');
    if (href) {
      const urlFromHref = href.replace(/^\/in\//, '');
      // Check if it's a custom URL (not a numeric ID)
      if (!/^\d+$/.test(urlFromHref)) {
        console.log('Custom URL extracted from DOM:', urlFromHref);
        return urlFromHref;
      }
    }
    
    console.log('No custom URL found');
    return '';
  })();

  // Count recent activity
  const recentActivityCount = (() => {
    const activitySection = Array.from(document.querySelectorAll('section')).find(sec => 
      sec.textContent && /activity/i.test(sec.textContent)
    );
    if (activitySection) {
      return activitySection.querySelectorAll('li, div').length;
    }
    return 0;
  })();

  // Robust extraction for current position (first company/job listed under the name)
  const currentPosition = (() => {
    const nameH1 = document.querySelector('section h1, main h1');
    if (nameH1) {
      // Look for the first <ul> or <li> after the name
      let el = nameH1.parentElement;
      while (el && el !== document.body) {
        const ul = el.querySelector('ul');
        if (ul) {
          const firstLi = ul.querySelector('li');
          if (firstLi && firstLi.textContent) return firstLi.textContent.trim();
        }
        el = el.parentElement;
      }
    }
    return '';
  })();

  // Robust extraction for experience (look for sections with 'Experience' in the text)
  const experience = (() => {
    const sections = Array.from(document.querySelectorAll('section'));
    const expSection = sections.find(sec => sec.textContent && /experience/i.test(sec.textContent));
    if (expSection) {
      // Find all job titles (usually h3 or span with a lot of text)
      const jobs = Array.from(expSection.querySelectorAll('li, div')).filter(el => el.textContent && el.textContent.length > 10);
      return jobs.map(job => ({
        title: job.querySelector('h3, span')?.textContent?.trim() || '',
        company: job.querySelector('p, span')?.textContent?.trim() || '',
        duration: (() => {
          const dur = Array.from(job.querySelectorAll('span')).find(span => /year|month/i.test(span.textContent || ''));
          return dur?.textContent?.trim() || '';
        })()
      })).filter(j => j.title);
    }
    return [];
  })();

  // Robust extraction for education (look for sections with 'Education' in the text)
  const education = (() => {
    const sections = Array.from(document.querySelectorAll('section'));
    const eduSection = sections.find(sec => sec.textContent && /education/i.test(sec.textContent));
    if (eduSection) {
      const schools = Array.from(eduSection.querySelectorAll('li, div')).filter(el => el.textContent && el.textContent.length > 10);
      return schools.map(school => ({
        school: school.querySelector('h3, span')?.textContent?.trim() || '',
        degree: school.querySelector('span')?.textContent?.trim() || '',
        field: '', // Not always available
        duration: (() => {
          const dur = Array.from(school.querySelectorAll('span')).find(span => /[0-9]{4}/.test(span.textContent || ''));
          return dur?.textContent?.trim() || '';
        })()
      })).filter(s => s.school);
    }
    return [];
  })();

  // Robust extraction for skills (look for sections with 'Skills' in the text)
  const skills = (() => {
    const sections = Array.from(document.querySelectorAll('section'));
    const skillSection = sections.find(sec => sec.textContent && /skills/i.test(sec.textContent));
    if (skillSection) {
      const skillItems = Array.from(skillSection.querySelectorAll('li, span')).filter(el => el.textContent && el.textContent.length > 1);
      return skillItems.map(item => ({
        name: item.textContent?.trim() || '',
        endorsements: 0 // Endorsements are hard to get without class, so default to 0
      })).filter(s => s.name);
    }
    return [];
  })();

  // Robust extraction for connections (look for text like 'connections')
  const connections = (() => {
    const el = Array.from(document.querySelectorAll('span, li, div')).find(e => /connections/i.test(e.textContent || ''));
    if (el) {
      const match = el.textContent?.match(/[0-9,]+/);
      if (match) return parseInt(match[0].replace(/,/g, ''));
    }
    return 0;
  })();

  // Robust extraction for recommendations (look for text like 'recommendations')
  const recommendations = (() => {
    const el = Array.from(document.querySelectorAll('span, li, div')).find(e => /recommendation/i.test(e.textContent || ''));
    if (el) {
      const match = el.textContent?.match(/[0-9,]+/);
      if (match) return parseInt(match[0].replace(/,/g, ''));
    }
    return 0;
  })();

  // Extract country/location
  const country = (() => {
    // Try to find the specific span for location
    const loc = document.querySelector('span.text-body-small.inline.t-black--light.break-words');
    if (loc && loc.textContent) {
      return loc.textContent.trim();
    }
    // Fallback to previous logic
    const fallbackLoc = document.querySelector('span.text-body-small, .text-body-small, [class*=location], [class*=address]');
    if (fallbackLoc && fallbackLoc.textContent) {
      const parts = fallbackLoc.textContent.split(',').map(s => s.trim());
      return parts[parts.length - 1] || '';
    }
    return '';
  })();

  // Extract profile background image
  const backgroundImage = (() => {
    const bgDiv = document.querySelector('.profile-background-image');
    if (bgDiv) {
      const style = window.getComputedStyle(bgDiv);
      const bg = style.backgroundImage;
      if (bg && bg !== 'none') {
        // Extract URL from background-image: url("...")
        const match = bg.match(/url\(["']?(.*?)["']?\)/);
        if (match && match[1]) return match[1];
      }
    }
    return '';
  })();

  const profileData: ProfileData = {
    name,
    headline,
    currentPosition,
    hasProfilePhoto,
    summary,
    customUrl,
    recentActivityCount,
    experience,
    education,
    skills,
    connections,
    recommendations,
    country,
    backgroundImage
  };

  return profileData;
};

const extractText = (selector: string, parent?: Element): string => {
  const element = parent 
    ? parent.querySelector(selector)
    : document.querySelector(selector);
  return element ? element.textContent?.trim() || '' : '';
};

const extractExperience = () => {
  const experienceItems = document.querySelectorAll('.experience-section .pv-entity__position-group');
  return Array.from(experienceItems).map(item => ({
    title: extractText('.pv-entity__name', item),
    company: extractText('.pv-entity__secondary-title', item),
    duration: extractText('.pv-entity__date-range span:nth-child(2)', item)
  }));
};

const extractEducation = () => {
  const educationItems = document.querySelectorAll('.education-section .pv-education-entity');
  return Array.from(educationItems).map(item => ({
    school: extractText('.pv-entity__school-name', item),
    degree: extractText('.pv-entity__degree-name span:nth-child(2)', item),
    field: extractText('.pv-entity__fos span:nth-child(2)', item),
    duration: extractText('.pv-entity__dates span:nth-child(2)', item)
  }));
};

const extractSkills = () => {
  const skillItems = document.querySelectorAll('.pv-skill-category-entity');
  return Array.from(skillItems).map(item => ({
    name: extractText('.pv-skill-category-entity__name', item),
    endorsements: parseInt(extractText('.pv-skill-category-entity__endorsement-count', item) || '0')
  }));
};

const extractConnections = (): number => {
  const connectionsText = extractText('.pv-top-card--list-bullet .pv-top-card--list-bullet');
  return parseInt(connectionsText?.replace(/[^0-9]/g, '') || '0');
};

const extractRecommendations = (): number => {
  const recommendationsText = extractText('.pv-recommendations-section .pv-recommendations-section__count');
  return parseInt(recommendationsText?.replace(/[^0-9]/g, '') || '0');
}; 