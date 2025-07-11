const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configure CORS
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;

async function scrapeLinkedInProfile(profileUrl) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set a longer timeout for navigation
    await page.setDefaultNavigationTimeout(30000);
    
    // Go directly to the public profile URL (no login)
    await page.goto(profileUrl, { waitUntil: 'networkidle2' });
    
    // Wait for the profile to load
    await page.waitForSelector('.pv-top-card', { timeout: 10000 })
      .catch(() => console.log('Profile card not found, continuing anyway'));

    // Scroll to load all sections
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Extract profile data
    const profileData = await page.evaluate(() => {
      const getText = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.innerText.trim() : '';
      };

      const getSectionByTitle = (title) => {
        const sections = Array.from(document.querySelectorAll('section'));
        return sections.find(section => {
          const heading = section.querySelector('h2');
          return heading && heading.innerText.includes(title);
        });
      };

      const experienceSection = getSectionByTitle('Experience');
      const educationSection = getSectionByTitle('Education');
      const skillsSection = getSectionByTitle('Skills');

      const experience = experienceSection ? Array.from(experienceSection.querySelectorAll('li')).map(item => {
        const title = item.querySelector('h3')?.innerText.trim() || '';
        const company = item.querySelector('h4')?.innerText.trim() || '';
        const dateRange = item.querySelector('.pv-entity__date-range')?.innerText.trim() || '';
        const description = item.querySelector('.pv-entity__description')?.innerText.trim() || '';
        return { title, company, dateRange, description };
      }) : [];

      const education = educationSection ? Array.from(educationSection.querySelectorAll('li')).map(item => {
        const school = item.querySelector('h3')?.innerText.trim() || '';
        const degree = item.querySelector('h4')?.innerText.trim() || '';
        const dateRange = item.querySelector('.pv-entity__date-range')?.innerText.trim() || '';
        return { school, degree, dateRange };
      }) : [];

      const skills = skillsSection ? Array.from(skillsSection.querySelectorAll('.pv-skill-category-entity__name')).map(skill => skill.innerText.trim()) : [];

      return {
        name: getText('.pv-top-card--list li:first-child'),
        headline: getText('.pv-top-card--list-bullet'),
        experience,
        education,
        skills
      };
    });

    return profileData;
  } catch (error) {
    console.error('Error in scrapeLinkedInProfile:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/scrape-profile', async (req, res) => {
  try {
    const { profileUrl } = req.body;
    if (!profileUrl) {
      return res.status(400).json({ error: 'Profile URL is required' });
    }

    const profileData = await scrapeLinkedInProfile(profileUrl);
    res.json(profileData);
  } catch (error) {
    console.error('Error scraping profile:', error);
    res.status(500).json({ 
      error: 'Failed to scrape profile',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 