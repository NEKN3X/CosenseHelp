import { Fzf, byLengthAsc } from 'fzf';
import { expandHelpfeel, makeCosenseUrl } from './cosense';
import { CosenseHelpStorageItem } from './storage/cosenseHelp';
import { WebHelpStorageItem } from './storage/webHelp';

export type SuggestType = 'WEB' | 'COSENSE_PAGE' | 'COSENSE_HELP';
export type Suggest = {
  type: SuggestType;
  title: string;
  url: string;
};

export function makeSuggest(
  type: SuggestType,
  title: string,
  url: string,
): Suggest {
  return { type, title, url };
}

export function makeWebSuggest(storage: WebHelpStorageItem): Suggest[] {
  return storage.flatMap((item) => [
    ...expandHelpfeel(item.helpfeel).map(
      (command): Suggest => ({
        type: 'WEB',
        title: command,
        url: item.url,
      }),
    ),
  ]);
}

export function makeCosenseSuggest(storage: CosenseHelpStorageItem): Suggest[] {
  return storage.flatMap((item) => [
    ...item.pages.flatMap((page): Suggest[] => [
      {
        type: 'COSENSE_PAGE',
        url: makeCosenseUrl(item.project, page.page),
        title: page.page,
      },
      ...page.help.flatMap((help): Suggest[] => [
        ...expandHelpfeel(help.helpfeel).map(
          (command): Suggest => ({
            type: 'COSENSE_HELP',
            url: help.url,
            title: command,
          }),
        ),
      ]),
    ]),
  ]);
}

export function search(data: Suggest[], text: string): Suggest[] {
  const segmenter = new Intl.Segmenter(['ja-JP', `en-US`], {
    granularity: 'word',
  });
  const segmentText = (text: string) =>
    [...segmenter.segment(text)]
      .filter((segment) => segment.isWordLike)
      .map((x) => x.segment)
      .join(' ');
  const splitAlphaNum = (str: string) => {
    const parts = str.match(/\D+|\d+/g);
    return parts ? parts.join(' ') : '';
  };
  const segmented = data.map((x) => ({
    ...x,
    segmented: splitAlphaNum(segmentText(x.title)).toLowerCase(),
  }));
  const fzf = new Fzf(segmented, {
    selector: (x) => x.segmented,
    tiebreakers: [byLengthAsc],
  });
  const searchText = splitAlphaNum(segmentText(text)).toLowerCase();
  const result = fzf.find(searchText);
  return result
    .map((x) => x.item)
    .reduce((acc, item) => {
      if (acc.some((x) => x.url === item.url)) return acc;
      return [...acc, item];
    }, [] as Suggest[]);
}
