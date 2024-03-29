import puppeteer from "puppeteer";
import { client } from "./config";
import { SEARCH_TERMS } from "./constants";

const { launch } = puppeteer;

const scrapeWebsiteForTerm = async (mediaOutlet: string, url: string) => {
  const browser = await launch({ headless: "new" });
  const page = await browser.newPage();

  try {
    console.log("Searching now on", mediaOutlet);
    // Navigate to the URL
    await page.goto(url);

    // Extract the page content and check if the term is present
    const pageContent = await page.content();

    SEARCH_TERMS.forEach(async (term) => {
      const itemFound = pageContent.includes(term);

      if (itemFound) {
        console.log(`${term} found on ${mediaOutlet}.`);
        await new Promise<void>((resolve, reject) => {
          client.query(
            "INSERT INTO mentions (searchTerm, site) VALUES ($1, $2)",
            [term, mediaOutlet],
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
        console.log(`${term} not found on ${mediaOutlet}.`);
      }
    });
  } catch (error) {
    console.error(`Error scraping ${mediaOutlet}: ${(error as Error).message}`);
  } finally {
    await browser.close();
  }
};

const runScrapingSequentially = async (
  siteList: { site: string; url: string }[]
) => {
  for (const { site, url } of siteList) {
    await scrapeWebsiteForTerm(site, url);
  }
  console.log("Search finished at", new Date());
  process.exit();
};

const getSites = async () => {
  try {
    const response = await fetch("https://mencionometro.vercel.app/sites");
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
