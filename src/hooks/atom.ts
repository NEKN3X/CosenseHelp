import { expandHelpfeel } from '@/utils/cosense';
import { CosenseHelpStorageItem } from '@/utils/storage/cosenseHelp';
import { WebHelpStorageItem } from '@/utils/storage/webHelp';
import {
  makeCosenseSuggest,
  makeWebSuggest,
  search,
  Suggest,
} from '@/utils/suggest';
import { atom } from 'jotai';

export const commandInputAtom = atom<string>('');
export const activeUrlAtom = atom<string>('');

export const webStorageAtom = atom<WebHelpStorageItem>();
export const cosenseStorageAtom = atom<CosenseHelpStorageItem>();

export const allWebSuggestsAtom = atom<Suggest[]>((get) => {
  const webStorage = get(webStorageAtom);
  if (!webStorage) return [];
  return makeWebSuggest(webStorage);
});
export const allCosenseSuggestsAtom = atom<Suggest[]>((get) => {
  const cosenseStorage = get(cosenseStorageAtom);
  if (!cosenseStorage) return [];
  return makeCosenseSuggest(cosenseStorage);
});

export const allSuggestsAtom = atom<Suggest[]>((get) => [
  ...get(allWebSuggestsAtom),
  ...get(allCosenseSuggestsAtom),
]);

export const filteredSuggestsAtom = atom<Suggest[]>((get) => {
  const commandInput = get(commandInputAtom);
  if (!commandInput) return [];
  const input = get(commandInputAtom).toLowerCase();
  return search(get(allSuggestsAtom), input).slice(0, 10);
});

export type CommandPage = 'TOP' | 'ADD_HELP' | 'EDIT_HELP';
export const commandPagesAtom = atom<CommandPage[]>([]);
export const commandPageAtom = atom<CommandPage>((get) => {
  const pages = get(commandPagesAtom);
  return pages.length > 0 ? pages[pages.length - 1] : 'TOP';
});

export const expandedCommandAtom = atom<string[]>((get) => {
  const commandPage = get(commandPageAtom);
  if (commandPage !== 'ADD_HELP' && commandPage !== 'EDIT_HELP') return [];
  const commandInput = get(commandInputAtom);
  try {
    return expandHelpfeel(commandInput);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return [];
  }
});

export const activeTabHelpAtom = atom<string[]>((get) => {
  const webStorage = get(webStorageAtom);
  const activeUrl = get(activeUrlAtom);
  if (!webStorage || !activeUrl) return [];
  return webStorage
    .filter((item) => item.url === activeUrl)
    .map((item) => item.helpfeel);
});
