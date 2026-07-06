const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const WOTD_URL = 'https://www.vocabulary.com/word-of-the-day/';

/**
 * Scrapes the Word of the Day from vocabulary.com.
 */
async function scrapeWordOfTheDay() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();
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
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: auto; background-color: #f4f4f9; }
    .container { background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    h1 { color: #333; }
    h2 { color: #5a67d8; }
    p { color: #555; }
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

    await fs.writeFile('index.html', htmlContent);
    console.log('Successfully created index.html with the Word of the Day.');
  } catch (error) {
    console.error('An error occurred during scraping:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

scrapeWordOfTheDay();
