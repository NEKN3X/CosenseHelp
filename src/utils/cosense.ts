import { parse } from 'ts-monadic-parser';
import { literal } from './parser/helpfeel';
import { WebHelp } from './storage/webHelp';

export function matchCosenseUrl(url: string) {
  const result = url.match(/https?:\/\/scrapbox\.io\/([^/]+)\/([^/]*)/);
  if (!result) return [undefined, undefined];
  return [result[1], result[2]];
}

export function makeCosenseUrl(project: string, page?: string) {
  return `https://scrapbox.io/${project}/${page}`;
}

export function extractHelp(url: string, lines: string[]): WebHelp[] {
  const helpRegex = /^% (echo|open)\s+(http(s)?:\/\/[^\s]+)\s*$/;
  return lines
    .map((x, i) => ({
      text: x,
      next: i + 1 < lines.length ? lines[i + 1] : undefined,
    }))
    .filter((x) => /^\?\s/.test(x.text))
    .map((x) => {
      return {
        url:
          x.next && helpRegex.test(x.next) ? x.next.match(helpRegex)![2] : url,
        helpfeel: x.text.replace(/^\?\s+/, ''),
      };
    });
}

export function expandHelpfeel(
  helpfeel: string,
  glossary?: Map<string, string>,
) {
  let updatedHelpfeel = helpfeel;
  for (const [key, value] of glossary || []) {
    updatedHelpfeel = updatedHelpfeel.replace(
      new RegExp(`{${key}}`, 'g'),
      value,
    );
  }
  const result = parse(literal)(updatedHelpfeel);
  if (result.length === 0) throw new Error('Invalid input');
  if (result[0][1] !== '') throw new Error(`Unused input: ${result[0][1]}`);
  return result[0][0];
}

export function extractGlossary(lines: string[]): Map<string, string> {
  const glossaryRegex = /^(.+):\s+`(.+)`$/;
  const glossary = new Map(
    lines
      .map((line) => line.match(glossaryRegex))
      .filter((match) => match !== null)
      .map((match) => [match[1], match[2]]),
  );
  return glossary;
}
