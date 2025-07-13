import { useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  // Overall Score Section
  upgradeToPremium: string;
  accountEvaluation: string;
  good: string;
  medium: string;
  poor: string;
  
  // Loading and Error States
  aiAnalyzing: string;
  noAnalysisAvailable: string;
  error: string;
  
  // Section Titles
  url: string;
  headline: string;
  projects: string;
  education: string;
  experiences: string;
  skills: string;
  summary: string;
  recommendations: string;
  location: string;
  profilePicture: string;
  backgroundImage: string;
  keywordAnalysis: string;
  strengths: string;
  areasForImprovement: string;
  industryInsights: string;
  profileOptimization: string;
  competitiveAnalysis: string;
  featured: string;
  
  // Section Details
  criteria: string;
  analysisRecommendations: string;
  
  // Score Indicators
  points: string;
  outOf: string;
  others: string;
  languages: string;
  certificates: string;
  honorsAwards: string;
  volunteer: string;
  publications: string;
  courses: string;
  
  // Additional text from AIAnalysisSidebar
  relevantKeywords: string;
  missingKeywords: string;
  noSummaryAvailable: string;
  noIndustryInsightsAvailable: string;
  noCompetitiveAnalysisAvailable: string;
  noProfileOptimizationAvailable: string;
  logo: string;
  
  // Popup component
  linkedinProfileScorer: string;
  visitProfileMessage: string;
  github: string;
  reportIssues: string;
  
  // LinkedInProfileViewer component
  readingProfile: string;
  noProfileDataFound: string;
  notSet: string;
  debugInfo: string;
  hasCustomUrl: string;
  extractedUrl: string;
  profileCustomUrl: string;
  yes: string;
  no: string;
  none: string;
  notAvailable: string;
  
  // Scoring criteria translations
  headlineLength: string;
  summaryLength: string;
  words: string;
  hasExperienceDescriptions: string;
  numberOfExperiences: string;
  educationEntries: string;
  numberOfSkills: string;
  countryInformation: string;
  projectsPresent: string;
  noCustomLinkedInUrlFound: string;
  customLinkedInUrlFound: string;
  
  // Export functionality
  noDataToExport: string;
  exportSuccess: string;
  exportError: string;
  exporting: string;
  exportShareable: string;
  exportPDF: string;
  exportImage: string;
  exportTitle: string;
  shareableDescription: string;
  shareableDescriptionText: string;
  pdfDescription: string;
  pdfDescriptionText: string;
  imageDescription: string;
  imageDescriptionText: string;
  patents: string;
  testScores: string;
  organizations: string;
  contactInfo: string;
  causes: string;
  
  // Refresh limit functionality
  remainingRefreshes: string;
  resetsAt: string;
  dailyLimitReached: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    upgradeToPremium: 'Upgrade to Premium',
    accountEvaluation: 'Account Evaluation',
    good: 'Good',
    medium: 'Medium',
    poor: 'Poor',
    aiAnalyzing: 'AI is analyzing your profile...',
    noAnalysisAvailable: 'No analysis available',
    error: 'Error',
    url: 'URL',
    headline: 'Headline',
    projects: 'Projects',
    education: 'Education',
    experiences: 'Experiences',
    skills: 'Skills',
    summary: 'Summary',
    recommendations: 'Recommendations',
    location: 'Location',
    profilePicture: 'Profile Picture',
    backgroundImage: 'Background Image',
    keywordAnalysis: 'Keyword Analysis',
    strengths: 'Strengths',
    areasForImprovement: 'Areas for Improvement',
    industryInsights: 'Industry Insights',
    profileOptimization: 'Profile Optimization',
    competitiveAnalysis: 'Competitive Analysis',
    featured: 'Featured',
    criteria: 'Criteria',
    analysisRecommendations: 'Analysis Recommendations',
    points: 'pts',
    outOf: '/',
    others: 'Others',
    languages: 'Languages',
    certificates: 'Certificates',
    honorsAwards: 'Honors & Awards',
    volunteer: 'Volunteer',
    publications: 'Publications',
    courses: 'Courses',
    relevantKeywords: 'Relevant Keywords',
    missingKeywords: 'Missing Keywords',
    noSummaryAvailable: 'No Summary Available',
    noIndustryInsightsAvailable: 'No Industry Insights Available',
    noCompetitiveAnalysisAvailable: 'No Competitive Analysis Available',
    noProfileOptimizationAvailable: 'No Profile Optimization Available',
    logo: 'Logo',
    linkedinProfileScorer: 'LinkedIn Profile Scorer',
    visitProfileMessage: 'Visit Profile Message',
    github: 'GitHub',
    reportIssues: 'Report Issues',
    readingProfile: 'Reading Profile',
    noProfileDataFound: 'No Profile Data Found',
    notSet: 'Not Set',
    debugInfo: 'Debug Info',
    hasCustomUrl: 'Has Custom URL',
    extractedUrl: 'Extracted URL',
    profileCustomUrl: 'Profile Custom URL',
    yes: 'Yes',
    no: 'No',
    none: 'None',
    notAvailable: 'Not Available',
    headlineLength: 'Headline length',
    summaryLength: 'Summary length',
    words: 'words',
    hasExperienceDescriptions: 'Has experience descriptions',
    numberOfExperiences: 'Number of experiences',
    educationEntries: 'Education entries',
    numberOfSkills: 'Number of skills',
    countryInformation: 'Country information',
    projectsPresent: 'Projects present',
    noCustomLinkedInUrlFound: 'No custom LinkedIn URL found',
    customLinkedInUrlFound: 'Custom LinkedIn URL:',
    noDataToExport: 'No data available to export',
    exportSuccess: 'Export completed successfully!',
    exportError: 'Failed to export. Please try again.',
    exporting: 'Exporting...',
    exportShareable: 'Export Shareable Image',
    exportPDF: 'Export PDF Report',
    exportImage: 'Export as Image',
    exportTitle: 'Export Your Analysis',
    shareableDescription: 'Shareable Image:',
    shareableDescriptionText: ' Perfect for LinkedIn feeds and social media',
    pdfDescription: 'PDF Report:',
    pdfDescriptionText: ' Detailed analysis report for your records',
    imageDescription: 'Full Analysis Image:',
    imageDescriptionText: ' Complete sidebar analysis as image',
    patents: 'Patents',
    testScores: 'Test Scores',
    organizations: 'Organizations',
    contactInfo: 'Contact Info',
    causes: 'Causes',
    remainingRefreshes: 'Remaining refreshes',
    resetsAt: 'Resets at',
    dailyLimitReached: 'Daily limit reached'
  },
  ar: {
    upgradeToPremium: 'ترقية الى برينيوم',
    accountEvaluation: 'تقييم حسابك',
    good: 'جيد',
    medium: 'متوسط',
    poor: 'سيئ',
    aiAnalyzing: 'الذكاء الاصطناعي يحلل ملفك الشخصي...',
    noAnalysisAvailable: 'لا يوجد تحليل متاح',
    error: 'خطأ',
    url: 'الرابط',
    headline: 'العنوان',
    projects: 'المشاريع',
    education: 'التعليم',
    experiences: 'الخبرات',
    skills: 'المهارات',
    summary: 'الملخص',
    recommendations: 'التوصيات',
    location: 'الموقع',
    profilePicture: 'صورة الملف الشخصي',
    backgroundImage: 'صورة الخلفية',
    keywordAnalysis: 'تحليل الكلمات المفتاحية',
    strengths: 'نقاط القوة',
    areasForImprovement: 'مجالات التحسين',
    industryInsights: 'رؤى المجال',
    profileOptimization: 'تحسين الملف الشخصي',
    competitiveAnalysis: 'التحليل التنافسي',
    featured: 'المميز',
    criteria: 'المعايير',
    analysisRecommendations: 'توصيات التحليل',
    points: 'نقاط',
    outOf: '/',
    others: 'الأخرى',
    languages: 'اللغات',
    certificates: 'الشهادات',
    honorsAwards: 'الجوائز والأوسمة',
    volunteer: 'التطوع',
    publications: 'المنشورات',
    courses: 'الدورات',
    relevantKeywords: 'الكلمات المفتاحية المتعلقة',
    missingKeywords: 'الكلمات المفتاحية المفقودة',
    noSummaryAvailable: 'لا يوجد ملخص متاح',
    noIndustryInsightsAvailable: 'لا يوجد رؤيات صناعية متاحة',
    noCompetitiveAnalysisAvailable: 'لا يوجد تحليل تنافسي متاح',
    noProfileOptimizationAvailable: 'لا يوجد تحسين ملف شخصي متاح',
    logo: 'شعار',
    linkedinProfileScorer: 'مقيم ملف لينكد إن الشخصي',
    visitProfileMessage: 'قم بزيارة أي ملف لينكد إن شخصي لرؤية تقييم الملف والرؤى',
    github: 'جيثب',
    reportIssues: 'الإبلاغ عن المشاكل',
    readingProfile: 'قراءة الملف الشخصي',
    noProfileDataFound: 'لم يتم العثور على بيانات الملف الشخصي',
    notSet: 'غير محدد',
    debugInfo: 'معلومات التصحيح',
    hasCustomUrl: 'لديه رابط خاص',
    extractedUrl: 'رابط خاص استخرج',
    profileCustomUrl: 'رابط خاص الملف الشخصي',
    yes: 'نعم',
    no: 'لا',
    none: 'لا',
    notAvailable: 'غير متاح',
    headlineLength: 'طول العنوان',
    summaryLength: 'طول الملخص',
    words: 'كلمات',
    hasExperienceDescriptions: 'لديه وصف للخبرات',
    numberOfExperiences: 'عدد الخبرات',
    educationEntries: 'المدخلات التعليمية',
    numberOfSkills: 'عدد المهارات',
    countryInformation: 'معلومات البلد',
    projectsPresent: 'المشاريع موجودة',
    noCustomLinkedInUrlFound: 'لم يتم العثور على رابط لينكد إن مخصص',
    customLinkedInUrlFound: 'رابط لينكد إن مخصص:',
    noDataToExport: 'لا توجد بيانات متاحة للتصدير',
    exportSuccess: 'تم التصدير بنجاح!',
    exportError: 'فشل في التصدير. يرجى المحاولة مرة أخرى.',
    exporting: 'جاري التصدير...',
    exportShareable: 'تصدير صورة قابلة للمشاركة',
    exportPDF: 'تصدير تقرير PDF',
    exportImage: 'تصدير كصورة',
    exportTitle: 'تصدير تحليلك',
    shareableDescription: 'صورة قابلة للمشاركة:',
    shareableDescriptionText: ' مثالية لمواقع التواصل الاجتماعي',
    pdfDescription: 'تقرير PDF:',
    pdfDescriptionText: ' تقرير تحليل مفصل لسجلاتك',
    imageDescription: 'صورة التحليل الكاملة:',
    imageDescriptionText: ' تحليل الشريط الجانبي الكامل كصورة',
    patents: 'براءات الاختراع',
    testScores: 'درجات الاختبار',
    organizations: 'المنظمات',
    contactInfo: 'معلومات الاتصال',
    causes: 'القضايا التطوعية',
    remainingRefreshes: 'التحديثات المتبقية',
    resetsAt: 'إعادة تعيين في',
    dailyLimitReached: 'تم الوصول للحد اليومي'
  }
};

export const getTranslation = (language: Language, key: keyof Translations): string => {
  return translations[language][key];
};

// Hook to get current language based on document direction
export const useLanguage = (): Language => {
  const [language, setLanguage] = useState<Language>(() => {
    // Check multiple sources for language detection
    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    const documentLang = document.documentElement.lang;
    const documentDir = document.documentElement.dir;
    
    // Priority: document lang > document dir > browser language
    if (documentLang === 'ar' || documentDir === 'rtl') {
      return 'ar';
    }
    
    if (browserLang.startsWith('ar') || browserLang.includes('ar')) {
      return 'ar';
    }
    
    return 'en';
  });

  useEffect(() => {
    const updateLanguage = () => {
      const browserLang = navigator.language || navigator.languages?.[0] || 'en';
      const documentLang = document.documentElement.lang;
      const documentDir = document.documentElement.dir;
      
      let newLanguage: Language = 'en';
      
      if (documentLang === 'ar' || documentDir === 'rtl') {
        newLanguage = 'ar';
      } else if (browserLang.startsWith('ar') || browserLang.includes('ar')) {
        newLanguage = 'ar';
      }
      
      setLanguage(newLanguage);
    };

    // Update language when browser language changes
    const observer = new MutationObserver(updateLanguage);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang', 'dir']
    });

    // Listen for language change events
    window.addEventListener('languagechange', updateLanguage);

    return () => {
      observer.disconnect();
      window.removeEventListener('languagechange', updateLanguage);
    };
  }, []);

  return language;
}; 