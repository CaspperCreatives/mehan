# Score Service

The Score Service provides comprehensive LinkedIn profile scoring based on predefined criteria. It analyzes various sections of a LinkedIn profile and assigns scores based on completeness, quality, and best practices.

## Features

- **Comprehensive Scoring**: Evaluates 30+ profile sections
- **Flexible Criteria**: Configurable scoring rules for each section
- **Detailed Breakdown**: Provides section-by-section analysis
- **Grade System**: Converts scores to letter grades (A+ to F)
- **Percentage Calculation**: Shows overall profile completion percentage

## Usage

### Basic Usage

```typescript
import { ScoreService } from './score.service';

const scoreService = new ScoreService();
const profileScore = scoreService.calculateProfileScore(profileData);
```

### API Endpoint

```typescript
// Call the Firebase function
const result = await calculateProfileScore({
  data: { profileData: linkedInProfileData }
});
```

## Scoring Criteria

The service evaluates profiles based on the following criteria:

### Core Profile (25 points)
- **LinkedIn URL**: 5 points
- **Country**: 5 points
- **Headline Length**: 10 points (min 10 words)
- **Headline Keywords**: 10 points (professional keywords)

### Summary (30 points)
- **Summary Length**: 20 points (min 200 words)
- **Email in Summary**: 10 points

### Experience (20 points)
- **Experience Descriptions**: 10 points
- **Experience Count**: 10 points (min 3 positions)

### Education & Skills (25 points)
- **Education**: 10 points
- **Skills**: 15 points (min 3 skills)

### Additional Sections (20 points)
- **Publications**: 1 point
- **Languages**: 1 point
- **Certificates**: 1 point
- **Honors/Awards**: 1 point
- **Volunteer**: 1 point
- **Patents**: 1 point
- **Test Scores**: 1 point
- **Organizations**: 1 point
- **Featured Content**: 1 point
- **Projects**: 1 point
- **Recommendations**: 1 point
- **Causes**: 1 point
- **Contact Info**: 1 point

**Total Maximum Score: 120 points**

## Grade Scale

- **A+**: 90-100%
- **A**: 85-89%
- **A-**: 80-84%
- **B+**: 75-79%
- **B**: 70-74%
- **B-**: 65-69%
- **C+**: 60-64%
- **C**: 55-59%
- **C-**: 50-54%
- **D+**: 45-49%
- **D**: 40-44%
- **D-**: 35-39%
- **F**: Below 35%

## Response Format

```typescript
interface ProfileScore {
  totalScore: number;           // Actual score achieved
  maxTotalScore: number;        // Maximum possible score
  percentage: number;           // Percentage score
  grade: string;                // Letter grade (A+, B, etc.)
  sectionScores: SectionScore[]; // Detailed breakdown
}

interface SectionScore {
  section: string;              // Section name
  score: number;                // Score achieved
  maxScore: number;             // Maximum possible score
  details: string;              // Detailed explanation
}
```

## Example Output

```typescript
{
  totalScore: 89,
  maxTotalScore: 120,
  percentage: 74,
  grade: "B",
  sectionScores: [
    {
      section: "linkedInUrl",
      score: 5,
      maxScore: 5,
      details: "LinkedIn URL present (5/5)"
    },
    {
      section: "headline",
      score: 8,
      maxScore: 10,
      details: "Headline: 8 words (min: 10) (8/10)"
    }
    // ... more sections
  ]
}
```

## Testing

Run the test file to see how the scoring works with sample data:

```bash
cd functions/src/services
ts-node score.service.test.ts
```

## Customization

To modify scoring criteria, update the `SCORING_CRITERIA` array in the `ScoreService` class. Each criteria object supports:

- `section`: Profile section name
- `criteria`: Scoring method
- `max_score`: Maximum points for this section
- `calculate`: Additional calculation parameters (min values, types, etc.)

## Integration

The score service is integrated into the main Firebase functions and can be called via:

1. **Direct import**: Import and use in other services
2. **API endpoint**: Call `calculateProfileScore` function
3. **Background processing**: Use in scheduled functions for batch scoring

## Performance

- **Fast**: Processes profiles in milliseconds
- **Scalable**: Handles large numbers of profiles efficiently
- **Memory Efficient**: Minimal memory footprint per calculation
- **Cached**: Results can be cached for repeated analysis
