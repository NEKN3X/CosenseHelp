import { storage } from '#imports';
import { Unwatch } from 'wxt/utils/storage';
import { WebHelp } from './webHelp';

type CosensePage = {
  page: string;
  help: WebHelp[];
};
type CosenseProject = {
  project: string;
  pages: CosensePage[];
};
export type CosenseHelpStorageItem = CosenseProject[];

export function isSameCosensePage(a: CosensePage) {
  return (b: CosensePage) => a.page === b.page;
}

const cosenseHelpStorage = storage.defineItem<CosenseHelpStorageItem>(
  'local:cosenseHelp',
  { fallback: [] },
);

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
  const updatedPages = [...filteredPages, { page, help: help }];
  const updatedCosenseHelp = [
    ...filteredCosenseHelp,
    { project, pages: updatedPages },
  ];
  cosenseHelpStorage.setValue(updatedCosenseHelp);
}

export async function setCosenseHelps(project: string, pages: CosensePage[]) {
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
  const currentCosenseHelp = await getAllCosenseHelp();
  const filteredCosenseHelp = currentCosenseHelp.filter(
    (item) => item.project !== project,
  );
  const currentPages =
    currentCosenseHelp.find((item) => item.project === project)?.pages || [];
  const existingPages = currentPages.filter((item) =>
    pages.includes(item.page),
  );
  const newPages: CosensePage[] = pages
    .filter((page) => !currentPages.some((item) => item.page === page))
    .map((page) => ({ page, help: [] }));
  const updatedCosenseHelp = [
    ...filteredCosenseHelp,
    {
      project,
      pages: [...existingPages, ...newPages],
    },
  ];
  cosenseHelpStorage.setValue(updatedCosenseHelp);
}

export async function removeCosenseHelp(project: string, page: string) {
  const currentCosenseHelp = await getAllCosenseHelp();
  const filteredCosenseHelp = currentCosenseHelp.filter(
    (item) => item.project !== project,
  );
  const currentProject = currentCosenseHelp.find(
    (item) => item.project === project,
  );
  if (!currentProject) return;
  const updatedPages = currentProject.pages.filter(
    (item) => item.page !== page,
  );
  const updatedCosenseHelp = [
    ...filteredCosenseHelp,
    { project, pages: updatedPages },
  ];
  cosenseHelpStorage.setValue(updatedCosenseHelp);
}

export function watchCosenseHelp(
  callback: (cosenseHelp: CosenseHelpStorageItem) => void,
): [Promise<void>, Unwatch] {
  return [
    getAllCosenseHelp().then(callback),
    cosenseHelpStorage.watch(callback),
  ];
}
