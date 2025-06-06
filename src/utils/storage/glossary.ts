import { storage } from '#imports';

export type GlossaryStorageItem = Record<string, string>;

const glossaryStorage = storage.defineItem<GlossaryStorageItem>(
  'local:glossary',
  { fallback: {} },
);

export function exportGlossary() {
  return glossaryStorage.getValue();
}
export function importGlossary(data: GlossaryStorageItem) {
  return glossaryStorage.setValue(data);
}

export async function getGlossary() {
  const storage = await glossaryStorage.getValue();
  return new Map<string, string>(Object.entries(storage));
}

export async function setGlossary(glossary: Map<string, string>) {
  const updatedGlossary = Object.fromEntries(glossary);
  await glossaryStorage.setValue(updatedGlossary);
}
