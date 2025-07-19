/**
 * Maps section titles to profile data keys
 * Used for mapping section names to their corresponding data in the profile object
 */
export const sectionDataMap: { [key: string]: string } = {
  'summary': 'about',
  'experiences': 'experience',
  'education': 'education',
  'skills': 'skills',
  'projects': 'projects',
  'recommendations': 'recommendations',
  'publications': 'publications',
  'certificates': 'certifications',
  'languages': 'languages',
  'volunteer': 'volunteering',
  'honorsawards': 'honorsAwards',
  'patents': 'patents',
  'testscores': 'testScores',
  'organizations': 'organizations',
  'featured': 'featured',
  'contactinfo': 'contactInfo',
  'headline': 'headline'
};

/**
 * Gets the profile data key for a given section title
 * @param sectionTitle - The section title to look up
 * @returns The corresponding profile data key or null if not found
 */
export const getProfileKeyForSection = (sectionTitle: string): string | null => {
  return sectionDataMap[sectionTitle.toLowerCase()] || null;
}; 