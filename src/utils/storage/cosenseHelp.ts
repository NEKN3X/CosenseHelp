import { storage } from '#imports';
import { Unwatch } from 'wxt/utils/storage';
import { WebHelp } from './webHelp';

type CosenseProject = {
  project: string;
  pages: string[];
};
export type CosensePageStorageItem = CosenseProject[];

const cosensePageStorage = storage.defineItem<CosensePageStorageItem>(
  'local:cosensePage',
  { fallback: [] },
);

type CosenseHelpPage = {
  page: string;
  help: WebHelp[];
};
type CosenseHelp = {
  project: string;
  pages: CosenseHelpPage[];
};
export type CosenseHelpStorageItem = CosenseHelp[];

export function isSameCosensePage(a: CosenseHelpPage) {
  return (b: CosenseHelpPage) => a.page === b.page;
}

const cosenseHelpStorage = storage.defineItem<CosenseHelpStorageItem>(
  'sync:cosenseHelp',
  { fallback: [] },
);

export function exportCosensePage() {
  return cosensePageStorage.getValue();
}
export function exportCosenseHelp() {
  return cosenseHelpStorage.getValue();
}
export function importCosensePage(data: CosensePageStorageItem) {
  return cosensePageStorage.setValue(data);
}
export function importCosenseHelp(data: CosenseHelpStorageItem) {
  return cosenseHelpStorage.setValue(data);
}

export function getAllCosensePage() {
  return cosensePageStorage.getValue();
}

export function getAllCosenseHelp() {
  return cosenseHelpStorage.getValue();
}

export async function setCosenseHelp(
  project: string,
  page: string,
  help: WebHelp[],
) {
  const currentCosenseHelp = await getAllCosenseHelp();
  const filteredCosenseHelp = currentCosenseHelp.filter(
    (item) => item.project !== project,
  );
  const currentProject = currentCosenseHelp.find(
    (item) => item.project === project,
  );
  const currentPages = currentProject?.pages || [];
  const filteredPages = currentPages.filter((item) => item.page !== page);
  const updatedPages =
    help.length > 0 ? [...filteredPages, { page, help: help }] : filteredPages;
  const updatedCosenseHelp = [
    ...filteredCosenseHelp,
    { project, pages: updatedPages },
  ];
  cosenseHelpStorage.setValue(updatedCosenseHelp);
}

export async function setCosenseHelps(
  project: string,
  pages: CosenseHelpPage[],
) {
  const currentCosenseHelp = await getAllCosenseHelp();
  const filteredCosenseHelp = currentCosenseHelp.filter(
    (item) => item.project !== project,
  );
  const currentPages =
    currentCosenseHelp.find((item) => item.project === project)?.pages || [];
  const filteredPages = currentPages.filter(
    (item) => !pages.some(isSameCosensePage(item)),
  );
  const updatedPages = [...filteredPages, ...pages];
  const updatedCosenseHelp = [
    ...filteredCosenseHelp,
    { project, pages: updatedPages },
  ];
  cosenseHelpStorage.setValue(updatedCosenseHelp);
}

export async function setCosensePages(project: string, pages: string[]) {
  const currentCosenseHelp = await getAllCosensePage();
  const filteredCosenseHelp = currentCosenseHelp.filter(
    (item) => item.project !== project,
  );
  const currentPages =
    currentCosenseHelp.find((item) => item.project === project)?.pages || [];
  const existingPages = currentPages.filter((item) => pages.includes(item));
  const newPages: string[] = pages.filter(
    (page) => !currentPages.includes(page),
  );
  const updatedCosenseHelp = [
    ...filteredCosenseHelp,
    {
      project,
      pages: [...existingPages, ...newPages],
    },
  ];
  cosensePageStorage.setValue(updatedCosenseHelp);
}

export async function removeCosenseHelp(project: string, page: string) {
  const currentCosenseHelp = await getAllCosensePage();
  const filteredCosenseHelp = currentCosenseHelp.filter(
    (item) => item.project !== project,
  );
  const currentProject = currentCosenseHelp.find(
    (item) => item.project === project,
  );
  if (!currentProject) return;
  const updatedPages = currentProject.pages.filter((item) => item !== page);
  const updatedCosenseHelp = [
    ...filteredCosenseHelp,
    { project, pages: updatedPages },
  ];
  cosensePageStorage.setValue(updatedCosenseHelp);
}

export function watchCosensePage(
  callback: (cosenseHelp: CosensePageStorageItem) => void,
): [Promise<void>, Unwatch] {
  return [
    getAllCosensePage().then(callback),
    cosensePageStorage.watch(callback),
  ];
}

export function watchCosenseHelp(
  callback: (cosenseHelp: CosenseHelpStorageItem) => void,
): [Promise<void>, Unwatch] {
  return [
    getAllCosenseHelp().then(callback),
    cosenseHelpStorage.watch(callback),
  ];
}
