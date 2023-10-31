import puppeteer from "puppeteer";
import { client } from "./config.mjs";

const { launch } = puppeteer;

const SEARCH_TERMS = ["Neymar"];

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
      await new Promise((resolve, reject) => {
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
      });
    } else {
      console.log(`${searchTerm} not found on ${mediaOutlet}.`);
    }
  } catch (error) {
    console.error(`Error scraping ${mediaOutlet}: ${error.message}`);
  } finally {
    await browser.close();
  }
};

const runScrapingSequentially = async (siteList) => {
  for (const searchTerm of SEARCH_TERMS) {
    for (const { site, url } of siteList) {
      await scrapeWebsiteForTerm(site, url, searchTerm);
    }
  }
  console.log("Search finished at", new Date());
  process.exit();
};

const getSites = async () => {
  try {
    const response = await fetch("https://neymarmeter.vercel.app/sites");
    if (!response.ok) {
      throw new Error("Something went wrong with the request.");
    }
    const siteList = await response.json();
    siteList && setTimeout(() => runScrapingSequentially(siteList), 5000);
  } catch (error) {
    console.error("Error:", error);
  }
};

getSites();
