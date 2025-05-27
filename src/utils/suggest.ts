import { Fzf, byLengthAsc } from 'fzf';
import { matchCosenseUrl } from './cosense';
import { getAllCosenseHelp } from './storage/cosenseHelp';
import { getAllWebHelp } from './storage/webHelp';

type SuggestType = 'WEB' | 'COSENSE_PAGE' | 'COSENSE_HELP';
type Suggest = {
  type: SuggestType;
  title: string;
  url: string;
};

export async function getAllHelp(): Promise<Suggest[]> {
  const webHelp = await getAllWebHelp();
  const cosenseHelp = await getAllCosenseHelp();
  const webHelpSuggests: Suggest[] = webHelp.map((item) => ({
    url: item.url,
    title: item.helpfeel,
    type: 'WEB',
  }));
  const cosenseHelpSuggests: Suggest[] = cosenseHelp.flatMap((item) => [
    {
      url: item.page,
      title: matchCosenseUrl(item.page)![0],
      type: 'COSENSE_PAGE',
    },
    ...item.help.map(
      (help): Suggest => ({
        url: help.url,
        title: help.helpfeel,
        type: 'COSENSE_HELP',
      }),
    ),
  ]);

  return [...webHelpSuggests, ...cosenseHelpSuggests];
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
  return result.map((x) => x.item);
}
