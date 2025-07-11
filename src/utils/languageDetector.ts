// import { Language } from './translations';

// export const detectAndSetLanguage = (): Language => {
//   // Get browser language
//   const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  
//   // Determine language
//   let language: Language = 'en';
//   if (browserLang.startsWith('ar') || browserLang.includes('ar')) {
//     language = 'ar';
//   }
  
//   // Set document attributes
//   document.documentElement.lang = language;
//   document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  
//   return language;
// };

// export const setLanguage = (language: Language): void => {
//   document.documentElement.lang = language;
//   document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
// };

// // Auto-detect and set language on module load
// if (typeof document !== 'undefined') {
//   detectAndSetLanguage();
// } 