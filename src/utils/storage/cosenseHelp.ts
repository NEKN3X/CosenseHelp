import { storage } from '#imports';
import { WebHelp } from './webHelp';

type CosenseHelp = {
  page: string;
  help: WebHelp[];
};
type CosenseHelpStorageItem = CosenseHelp[];

const cosenseHelpStorage = storage.defineItem<CosenseHelpStorageItem>(
  'local:cosenseHelp',
  { fallback: [] },
);

export function getAllCosenseHelp() {
  return cosenseHelpStorage.getValue();
}

export async function setCosenseHelp(page: string, help: WebHelp[]) {
  const currentCosenseHelp = await getAllCosenseHelp();
  const existingItem = currentCosenseHelp.find((item) => item.page === page);
  if (existingItem) return;

  const updatedCosenseHelp = [...currentCosenseHelp, { page, help }];
  cosenseHelpStorage.setValue(updatedCosenseHelp);
}

export async function setCosenseHelps(helps: CosenseHelp[]) {
  const currentCosenseHelp = await getAllCosenseHelp();
  const filteredHelps = currentCosenseHelp.filter(
    (item) => !helps.some((help) => help.page === item.page),
  );
  const updatedCosenseHelp = [...filteredHelps, ...helps];
  cosenseHelpStorage.setValue(updatedCosenseHelp);
}

export async function addCosensePages(pages: string[]) {
  const currentCosenseHelp = await getAllCosenseHelp();
  const filteredPages = pages.filter(
    (page) => !currentCosenseHelp.some((item) => item.page === page),
  );
  const updatedCosenseHelp = [
    ...currentCosenseHelp,
    ...filteredPages.map((page) => ({ page, help: [] })),
  ];
  cosenseHelpStorage.setValue(updatedCosenseHelp);
}

export async function removeCosenseHelp(page: string) {
  const currentCosenseHelp = await getAllCosenseHelp();
  const updatedCosenseHelp = currentCosenseHelp.filter(
    (item) => item.page !== page,
  );
  cosenseHelpStorage.setValue(updatedCosenseHelp);
}

export async function watchCosenseHelp(
  callback: (cosenseHelp: CosenseHelpStorageItem) => void,
) {
  const currentCosenseHelp = await getAllCosenseHelp();
  return [currentCosenseHelp, cosenseHelpStorage.watch(callback)];
}
