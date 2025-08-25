# Scraper Repository - LinkedIn Profile Scraping

This repository provides a specialized data access layer for LinkedIn profile scraping operations, built on top of the Firebase repository.

## Features

- **Single Profile Scraping**: Scrape individual LinkedIn profiles with detailed data
- **Batch Scraping**: Scrape multiple profiles efficiently with progress tracking
- **URL Validation**: Validate LinkedIn URLs and extract profile IDs
- **Comprehensive Data**: Extract all LinkedIn profile sections (experience, education, skills, etc.)
- **Error Handling**: Robust error handling with retry logic
- **Metadata Tracking**: Track scraping time, success rates, and performance metrics

## LinkedIn Profile Data Structure

The repository extracts comprehensive LinkedIn profile data including:

- **Basic Info**: Name, headline, location, summary
- **Experience**: Job titles, companies, durations, descriptions
- **Education**: Schools, degrees, fields of study, years
- **Skills**: Technical and soft skills
- **Certifications**: Professional certifications with issuers and dates
- **Languages**: Language proficiencies
- **Projects**: Personal and professional projects
- **Publications**: Research papers and articles
- **Patents**: Intellectual property
- **Volunteering**: Community service and volunteer work
- **Honors & Awards**: Achievements and recognitions
- **Contact Info**: Email, phone, website (when available)
- **Social Metrics**: Connections, recommendations

## Usage Examples

### Single Profile Scraping

```typescript
import { scraperRepository } from './scraper-repository';

// Basic scraping
const result = await scraperRepository.scrapeLinkedInProfile(
  'https://linkedin.com/in/johndoe'
);

if (result.success) {
  console.log('Profile name:', result.data?.name);
  console.log('Headline:', result.data?.headline);
  console.log('Experience count:', result.data?.experience?.length);
} else {
  console.error('Scraping failed:', result.error);
}
```

### Scraping with Options

```typescript
// Customize what data to scrape
const result = await scraperRepository.scrapeLinkedInProfile(
  'https://linkedin.com/in/johndoe',
  {
    includeContactInfo: true,
    includeSkills: true,
    includeEducation: true,
    includeExperience: true,
    includeCertifications: false, // Skip certifications
    includeLanguages: false,      // Skip languages
    includeProjects: true,
    includePublications: true
  }
);
```

### Batch Scraping

```typescript
const urls = [
  'https://linkedin.com/in/johndoe',
  'https://linkedin.com/in/janesmith',
  'https://linkedin.com/in/bobjohnson'
];

const batchResult = await scraperRepository.scrapeLinkedInProfilesBatch(urls);

if (batchResult.success) {
  console.log(`Successfully scraped ${batchResult.metadata?.successfulScrapes} profiles`);
  console.log(`Failed to scrape ${batchResult.metadata?.failedScrapes} profiles`);
  console.log(`Total time: ${batchResult.metadata?.totalTime}ms`);
  
  batchResult.data?.forEach(item => {
    if (item.success) {
      console.log(`✅ ${item.url}: ${item.profile.name}`);
    } else {
      console.log(`❌ ${item.url}: ${item.error}`);
    }
  });
}
```

### URL Validation and Processing

```typescript
// Validate LinkedIn URL
const isValid = scraperRepository.validateLinkedInUrl(
  'https://linkedin.com/in/johndoe'
);
console.log('URL is valid:', isValid);

// Extract profile ID
const profileId = scraperRepository.extractProfileId(
  'https://linkedin.com/in/johndoe'
);
console.log('Profile ID:', profileId); // "johndoe"
```

### Error Handling

```typescript
try {
  const result = await scraperRepository.scrapeLinkedInProfile(url);
  
  if (result.success) {
    // Process successful result
    processProfileData(result.data);
  } else {
    // Handle specific error
    switch (result.error) {
      case 'PROFILE_NOT_FOUND':
        console.log('Profile does not exist or is private');
        break;
      case 'RATE_LIMIT_EXCEEDED':
        console.log('Too many requests, please wait');
        break;
      case 'INVALID_URL':
        console.log('Invalid LinkedIn URL provided');
        break;
      default:
        console.log('Unknown error:', result.error);
    }
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## Configuration Options

### Scraping Options

You can customize what data to scrape by passing options:

```typescript
interface ScrapingOptions {
  includeContactInfo?: boolean;      // Email, phone, website
  includeRecommendations?: boolean;  // Number of recommendations
  includeConnections?: boolean;      // Number of connections
  includeSkills?: boolean;          // Technical and soft skills
  includeEducation?: boolean;       // Academic background
  includeExperience?: boolean;      // Work history
  includeCertifications?: boolean;  // Professional certifications
  includeLanguages?: boolean;       // Language proficiencies
  includeInterests?: boolean;       // Personal interests
  includeVolunteering?: boolean;    // Volunteer work
  includePublications?: boolean;     // Research papers
  includePatents?: boolean;         // Intellectual property
  includeCourses?: boolean;         // Online courses
  includeProjects?: boolean;        // Personal projects
  includeHonors?: boolean;          // Awards and honors
  includeTestScores?: boolean;      // Test scores
}
```

### Call Options

Configure Firebase call behavior:

```typescript
const callOptions = {
  timeout: 120000,    // 2 minutes timeout
  retries: 3,         // 3 retry attempts
  retryDelay: 2000    // 2 seconds between retries
};

const result = await scraperRepository.scrapeLinkedInProfile(
  url, 
  scrapingOptions, 
  callOptions
);
```

## Response Format

### Single Profile Response

```typescript
interface ScrapeProfileResponse {
  success: boolean;
  data?: LinkedInProfileData;
  error?: string;
  message?: string;
  metadata?: {
    scrapeTime?: number;
    url?: string;
    timestamp?: string;
  };
}
```

### Batch Response

```typescript
interface ScrapeBatchResponse {
  success: boolean;
  data?: Array<{
    url: string;
    profile: LinkedInProfileData;
    success: boolean;
    error?: string;
  }>;
  error?: string;
  metadata?: {
    totalUrls: number;
    successfulScrapes: number;
    failedScrapes: number;
    totalTime: number;
  };
}
```

## Best Practices

1. **URL Validation**: Always validate URLs before scraping
2. **Error Handling**: Implement proper error handling for failed scrapes
3. **Rate Limiting**: Respect LinkedIn's rate limits and implement delays
4. **Data Processing**: Process scraped data immediately or store it properly
5. **Monitoring**: Track scraping success rates and performance metrics
6. **Privacy**: Ensure compliance with LinkedIn's terms of service and privacy policies

## Testing

```typescript
import { ScraperRepository } from './scraper-repository';

// Test scraper functionality
const testResult = await scraperRepository.testScraper();
console.log('Scraper test:', testResult);

// Get scraper status
const status = await scraperRepository.getScraperStatus();
console.log('Scraper status:', status);

// Get scraping statistics
const stats = await scraperRepository.getScrapingStats();
console.log('Scraping stats:', stats);
```

## Performance Considerations

- **Batch Processing**: Use batch scraping for multiple profiles
- **Timeout Configuration**: Set appropriate timeouts for long-running scrapes
- **Retry Logic**: Implement retry logic for transient failures
- **Caching**: Cache scraped data to avoid re-scraping
- **Rate Limiting**: Implement delays between requests to avoid rate limiting
