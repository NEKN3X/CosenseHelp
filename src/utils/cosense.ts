import { WebHelp } from './storage/webHelp';

export function matchCosenseUrl(url: string) {
  const result = url.match(/https?:\/\/scrapbox\.io\/([^/]+)\/([^/]*)/);
  if (!result) return undefined;
  return [result[1], result[2]];
}

export function extractHelp(page: string, lines: string[]): WebHelp[] {
  const helpRegex = /^% (echo|open)\s+(.*)/;
  return lines
    .map((x, i) => ({
      text: x,
      next: i + 1 < lines.length ? lines[i + 1] : undefined,
    }))
    .filter((x) => /^\?\s/.test(x.text))
    .map((x) => {
      const url =
        x.next && helpRegex.test(x.next) ? x.next.match(helpRegex)![2] : page;

      return {
        url,
        helpfeel: x.text.replace(/^\?\s+/, ''),
      };
    });
}
