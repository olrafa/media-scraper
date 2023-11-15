import axios from "axios";
import { SAMPLE } from "../sample";
import { client } from "../config";
import { SEARCH_TERMS } from "../constants";

const [searchTerm] = SEARCH_TERMS;

type Story = {
  title: string;
  link: string;
  source: string;
  date: string;
  imageUrl: string;
};

let data = JSON.stringify({
  q: searchTerm,
  gl: "br",
  hl: "pt-br",
});

let config = {
  method: "post",
  url: "https://google.serper.dev/search",
  headers: {
    "X-API-KEY": process.env.SERPER_KEY,
    "Content-Type": "application/json",
  },
  data: data,
};

/* axios(config)
  .then((response) => console.log(response.data.topStories))
  .catch((error) => console.log(error)); */

const filterData = (stories: Story[]) => {
  const recentStories = stories.filter(
    ({ date }) => date.includes("hora") || date.includes("minuto")
  );

  addToTable(recentStories);
};

const addToTable = async (stories: Story[]) => {
  stories.map(({ title, link, source }) =>
    client.query(
      "INSERT INTO stories (term, title, link, source) values ($1, $2, $3, $4)",
      [searchTerm, title, link, source]
    )
  );
};

filterData(SAMPLE);
