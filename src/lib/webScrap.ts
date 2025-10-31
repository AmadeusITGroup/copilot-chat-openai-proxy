interface ScrappedData {
  title: string;
  content: string;
}
export function scrapUrl(url: string): ScrappedData[] {
  console.log(`Supposed to scrap ${url}. Not Yet implemented.`);
  return [];
}
