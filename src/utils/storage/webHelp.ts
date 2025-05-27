import { storage } from '#imports';

export type WebHelp = {
  url: string;
  helpfeel: string;
};
type WebHelpStorageItem = WebHelp[];

export function isSameWebHelp(a: WebHelp) {
  return (b: WebHelp) => a.url === b.url && a.helpfeel === b.helpfeel;
}

const webHelpStorage = storage.defineItem<WebHelpStorageItem>('sync:webHelp', {
  fallback: [],
});

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

export async function watchWebHelp(
  callback: (webHelp: WebHelpStorageItem) => void,
) {
  const currentWebHelp = await getAllWebHelp();
  return [currentWebHelp, webHelpStorage.watch(callback)];
}
