import puppeteer from "puppeteer";
import { client } from "./config.mjs";
import { SEARCH_TERMS, WEBSITES } from "./constants.mjs";

const { launch } = puppeteer;

const scrapeWebsiteForTerm = async (mediaOutlet, url, searchTerm) => {
  const browser = await launch({ headless: "new" });
  const page = await browser.newPage();

  try {
    console.log("Searching now on", mediaOutlet);
    // Navigate to the URL
    await page.goto(url);

    // Extract the page content and check if the term is present
    const pageContent = await page.content();

    const itemFound = pageContent.includes(searchTerm);

    if (itemFound) {
      console.log(`${searchTerm} found on ${mediaOutlet}.`);
      /* await new Promise((resolve, reject) => {
        client.query(
          "INSERT INTO mentions (searchTerm, site) VALUES ($1, $2)",
          [searchTerm, mediaOutlet],
          (error) => {
            if (error) {
              reject(error);
            } else {
              console.log("Mention added.");
              resolve();
            }
          }
        );
      }); */
    } else {
      console.log(`${searchTerm} not found on ${mediaOutlet}.`);
    }
  } catch (error) {
    console.error(`Error scraping ${mediaOutlet}: ${error.message}`);
  } finally {
    await browser.close();
  }
};

const runScrapingSequentially = async () => {
  for (const searchTerm of SEARCH_TERMS) {
    for (const { mediaOutlet, url } of WEBSITES) {
      await scrapeWebsiteForTerm(mediaOutlet, url, searchTerm);
    }
  }
  console.log("Search finished at", new Date());
  process.exit();
};

setTimeout(() => runScrapingSequentially(), 5000);
