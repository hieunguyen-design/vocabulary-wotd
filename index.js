const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const WOTD_URL = 'https://www.vocabulary.com/word-of-the-day/';

/**
 * Scrapes the Word of the Day from vocabulary.com.
 */
async function scrapeWordOfTheDay() {
  console.log('Launching browser...');
  // The '--no-sandbox' flag is required to run Puppeteer in a containerized environment like GitHub Actions.
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  try {
    console.log(`Navigating to ${WOTD_URL}...`);
    await page.goto(WOTD_URL, { waitUntil: 'networkidle2' });

    console.log('Waiting for word of the day content to load...');
    // This selector targets the container for the word of the day.
    const cardSelector = '.word-of-the-day';
    await page.waitForSelector(cardSelector);

    // Selectors for the word and its usage example.
    // These might change if the website updates its structure.
    const wordSelector = '.word-of-the-day';
    const usageSelector = 'p.txt-wod-usage';

    console.log('Extracting word and usage...');
    const word = await page.$eval(wordSelector, (el) => el.textContent.trim());
    const usage = await page.$eval(usageSelector, (el) => el.textContent.trim());

    console.log('Generating HTML content...');
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Word of the Day</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f7f8fa;
      color: #555;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 2rem;
      box-sizing: border-box;
    }
    .container {
      background: #fff;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      max-width: 600px;
      width: 100%;
      text-align: center;
    }
    h1 { color: #888; font-size: 1rem; font-weight: 400; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem; }
    h2 { color: #222; font-size: 3rem; font-weight: 700; margin: 0 0 1.5rem 0; }
    p { color: #444; font-size: 1.1rem; line-height: 1.7; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Word of the Day</h1>
    <h2>${word}</h2>
    <p>${usage}</p>
  </div>
</body>
</html>`;

    // Create a directory for the output and write the file there.
    const outputDir = '_site';
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(`${outputDir}/index.html`, htmlContent);
    console.log('Successfully created index.html with the Word of the Day.');
  } catch (error) {
    console.error('An error occurred during scraping:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

scrapeWordOfTheDay();
