import { storage } from '#imports';
import { Unwatch } from 'wxt/utils/storage';

export type WebHelp = {
  url: string;
  helpfeel: string;
};
export type WebHelpStorageItem = WebHelp[];

export function isSameWebHelp(a: WebHelp) {
  return (b: WebHelp) => a.url === b.url && a.helpfeel === b.helpfeel;
}

const webHelpStorage = storage.defineItem<WebHelpStorageItem>('sync:webHelp', {
  fallback: [],
});

export function exportWebHelp() {
  return webHelpStorage.getValue();
}
export function importWebHelp(data: WebHelpStorageItem) {
  return webHelpStorage.setValue(data);
}

export function getAllWebHelp() {
  return webHelpStorage.getValue();
}

export async function setWebHelp(url: string, helpfeel: string) {
  const currentWebHelp = await getAllWebHelp();
  const existingItem = currentWebHelp.find(isSameWebHelp({ url, helpfeel }));
  if (existingItem) return;
  const updatedWebHelp = [...currentWebHelp, { url, helpfeel }];
  webHelpStorage.setValue(updatedWebHelp);
}

export async function removeWebHelp(url: string, helpfeel: string) {
  const currentWebHelp = await getAllWebHelp();
  const updatedWebHelp = currentWebHelp.filter(
    (item) => !isSameWebHelp({ url, helpfeel })(item),
  );
  webHelpStorage.setValue(updatedWebHelp);
}

export async function updateWebHelp(
  url: string,
  helpfeel: string,
  newHelpfeel: string,
) {
  const currentWebHelp = await getAllWebHelp();
  const filteredWebHelp = currentWebHelp.filter(
    (item) => !isSameWebHelp({ url, helpfeel })(item),
  );
  const updatedWebHelp = [...filteredWebHelp, { url, helpfeel: newHelpfeel }];
  webHelpStorage.setValue(updatedWebHelp);
}

export function watchWebHelp(
  callback: (webHelp: WebHelpStorageItem) => void,
): [Promise<void>, Unwatch] {
  return [getAllWebHelp().then(callback), webHelpStorage.watch(callback)];
}
