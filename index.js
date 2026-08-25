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

    // More specific selectors for the word and usage.
    const wordSelector = 'a.word-of-the-day';
    const usageSelector = 'p.txt-wod-usage';

    console.log('Extracting word and usage...');
    const word = await page.$eval(wordSelector, (el) => el.textContent.trim());
    const usage = await page.$eval(usageSelector, (el) => el.textContent.trim());

    const wotd = {
      word,
      usage,
      date: new Date().toISOString(),
    };

    const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Word of the Day</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
      body {
        font-family:
          'Inter',
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Roboto,
          Helvetica,
          Arial,
          sans-serif;
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
      h1 {
        color: #888;
        font-size: 1rem;
        font-weight: 400;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 1rem;
      }
      h2 {
        color: #222;
        font-size: 3rem;
        font-weight: 700;
        margin: 0 0 1.5rem 0;
      }
      p {
        color: #444;
        font-size: 1.1rem;
        line-height: 1.7;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Word of the Day</h1>
      <h2 id="word">${word}</h2>
      <p id="usage">${usage}</p>
    </div>
    <script>
      async function fetchWordOfTheDay() {
        try {
          const response = await fetch('wotd.json');
          if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
          }
          const data = await response.json();
          if (data.word) document.getElementById('word').textContent = data.word;
          if (data.usage) document.getElementById('usage').textContent = data.usage;
        } catch (error) {
          console.error('Error fetching word of the day:', error);
        }
      }
      fetchWordOfTheDay();
    </script>
  </body>
</html>`;

    await fs.writeFile('wotd.json', JSON.stringify(wotd, null, 2));
    await fs.writeFile('index.html', htmlContent);

    console.log('Successfully scraped and saved the Word of the Day to wotd.json and index.html.');
    console.log(`Word of the Day: ${word}`);
    console.log(`Usage: ${usage}`);
  } catch (error) {
    console.error('An error occurred during scraping:', error);

    // Save the HTML of the page for debugging.
    const html = await page.content();
    await fs.writeFile('error.html', html);
    console.error('Saved page HTML to `error.html` for debugging.');

    process.exit(1);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

scrapeWordOfTheDay();
