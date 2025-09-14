/**
 * Maps section titles to profile data keys
 * Used for mapping section names to their corresponding data in the profile object
 */
export const sectionDataMap: { [key: string]: string } = {
  // Core profile sections
  'summary': 'summary',
  'headline': 'headline',
  'experiences': 'positions',
  'education': 'educations',
  'skills': 'skills',
  'projects': 'projects',
  'recommendations': 'recommendations',
  'publications': 'publications',
  'certificates': 'certifications',
  'languages': 'languages',
  'volunteer': 'volunteerExperiences',
  'honorsawards': 'honors',
  'patents': 'patents',
  'testscores': 'testScores',
  'organizations': 'organizations',
  'featured': 'featured',
  'contactinfo': 'contactInfo',
  'causes': 'causes',
  'courses': 'courses',
  
  // Additional profile sections
  'linkedinurl': 'inputUrl',
  'country': 'geoLocationName',
  'profilepicture': 'pictureUrl',
  'backgroundimage': 'backgroundImage',
  'connections': 'connectionsCount',
  'followers': 'followersCount',
  'opentowork': 'openToWork',
  'industry': 'industryName',
  'company': 'companyName',
  'jobtitle': 'jobTitle',
  'occupation': 'occupation',
  'firstname': 'firstName',
  'lastname': 'lastName',
  'publicidentifier': 'publicIdentifier',
  'trackingid': 'trackingId',
  'geourn': 'geoUrn',
  'industryurn': 'industryUrn',
  'companypublicid': 'companyPublicId',
  'companylinkedinurl': 'companyLinkedinUrl',
  'following': 'following',
  'followable': 'followable',
  'connectiontype': 'connectionType',
  'student': 'student'
};

/**
 * Gets the profile data key for a given section title
 * @param sectionTitle - The section title to look up
 * @returns The corresponding profile data key or null if not found
 */
export const getProfileKeyForSection = (sectionTitle: string): string | null => {
  return sectionDataMap[sectionTitle.toLowerCase()] || null;
}; 