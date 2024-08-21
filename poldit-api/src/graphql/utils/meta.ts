import * as cheerio from "cheerio";

export const getMetaTags = (content: string, name: string) => {
  const $ = cheerio.load(content);

  return (
    $(`meta[name=${name}]`).attr("content") ||
    $(`meta[property="og:${name}"]`).attr("content")
  );
};
