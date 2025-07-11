import { AIProfileAnalyzer } from './aiAnalyzer';

describe('AIProfileAnalyzer', () => {
  let analyzer: AIProfileAnalyzer;

  beforeEach(() => {
    analyzer = new AIProfileAnalyzer();
  });

  describe('Scoring System', () => {
    it('should generate scoring breakdown with new structure', () => {
      const mockProfileData = {
        name: 'John Doe',
        headline: 'Senior Software Engineer at Tech Company',
        about: 'Experienced software engineer with 5+ years in web development. Specialized in React, Node.js, and cloud technologies. Passionate about creating scalable solutions and mentoring junior developers.',
        country: 'United States',
        customUrl: 'johndoe',
        experience: [
          {
            title: 'Senior Software Engineer',
            company: 'Tech Company',
            description: 'Led development of web applications'
          },
          {
            title: 'Software Engineer',
            company: 'Startup Inc',
            description: 'Developed full-stack applications'
          }
        ],
        education: [
          {
            school: 'University of Technology',
            degree: 'Bachelor of Science',
            field: 'Computer Science'
          }
        ],
        skills: [
          { name: 'JavaScript', endorsements: 15 },
          { name: 'React', endorsements: 12 },
          { name: 'Node.js', endorsements: 10 },
          { name: 'Python', endorsements: 8 }
        ],
        projects: [
          {
            title: 'E-commerce Platform',
            description: 'Full-stack e-commerce solution',
            url: 'https://example.com'
          }
        ],
        recommendations: [
          { text: 'Great team player', author: 'Jane Smith' }
        ],
        basicInfo: {
          profilePicture: 'https://example.com/photo.jpg',
          backgroundImage: 'https://example.com/bg.jpg'
        }
      };

      // Use the private method through a public interface or create a test method
      const result = (analyzer as any).calculateScore(mockProfileData);
      
      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.scoringBreakdown).toBeDefined();
      expect(Array.isArray(result.scoringBreakdown)).toBe(true);
      
      // Check the new structure
      result.scoringBreakdown.forEach((section: any) => {
        expect(section).toHaveProperty('title');
        expect(section).toHaveProperty('score');
        expect(section).toHaveProperty('maxPossiblePoints');
        expect(section).toHaveProperty('criteria');
        expect(Array.isArray(section.criteria)).toBe(true);
        
        // Check that maxPossiblePoints is calculated correctly
        expect(section.maxPossiblePoints).toBeGreaterThan(0);
        expect(section.score).toBeLessThanOrEqual(section.maxPossiblePoints);
        
        // Check criteria structure
        section.criteria.forEach((criteria: any) => {
          expect(criteria).toHaveProperty('title');
          expect(criteria).toHaveProperty('point');
          expect(typeof criteria.title).toBe('string');
          expect(typeof criteria.point).toBe('number');
          expect(criteria.point).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it('should handle empty profile data gracefully', () => {
      const emptyProfileData = {
        name: '',
        headline: '',
        about: '',
        experience: [],
        education: [],
        skills: []
      };

      const result = (analyzer as any).calculateScore(emptyProfileData);
      
      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.scoringBreakdown).toBeDefined();
      expect(Array.isArray(result.scoringBreakdown)).toBe(true);
    });

    it('should provide enhanced fallback analysis with new structure', () => {
      const mockProfileData = {
        name: 'Jane Smith',
        headline: 'Marketing Manager',
        about: 'Marketing professional with experience in digital marketing and brand management.',
        experience: [
          { title: 'Marketing Manager', company: 'Company A' }
        ],
        education: [
          { school: 'University', degree: 'MBA' }
        ],
        skills: [
          { name: 'Digital Marketing', endorsements: 5 },
          { name: 'Brand Management', endorsements: 3 }
        ]
      };

      const result = (analyzer as any).getEnhancedFallbackAnalysis(mockProfileData);
      
      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.scoringBreakdown).toBeDefined();
      expect(Array.isArray(result.scoringBreakdown)).toBe(true);
      
      // Check that the new structure is maintained
      result.scoringBreakdown.forEach((section: any) => {
        expect(section).toHaveProperty('maxPossiblePoints');
        expect(section.maxPossiblePoints).toBeGreaterThan(0);
      });
    });
  });
});
