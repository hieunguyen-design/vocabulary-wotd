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

    console.log(`Word of the Day: ${word}`);
    console.log(`Usage: ${usage}`);

    const data = { word, usage };
    // Save the scraped data to a JSON file in the _site directory
    await fs.writeFile(`${__dirname}/_site/wotd.json`, JSON.stringify(data, null, 2));

    console.log('Successfully scraped and saved the Word of the Day.');
  } catch (error) {
    console.error('An error occurred during scraping:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

scrapeWordOfTheDay();
