export function matchCosenseUrl(url: string) {
  const result = url.match(/https?:\/\/scrapbox\.io\/([^/]+)\/([^/]*)/);
  if (!result) return undefined;
  return [result[1], result[2]];
}
