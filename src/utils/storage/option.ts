import { storage } from '#imports';

type OptionStorageItem = {
  newPageProject: string;
  autoImportProjects: string[];
};

const optionStorawge = storage.defineItem<OptionStorageItem>('sync:option', {
  fallback: {
    newPageProject: '',
    autoImportProjects: [],
  },
});

export function getOption() {
  return optionStorawge.getValue();
}

export async function setOption(newOption: Partial<OptionStorageItem>) {
  const currentOption = await getOption();
  optionStorawge.setValue({
    ...currentOption,
    ...newOption,
  });
}

export async function watchOption(
  callback: (option: OptionStorageItem) => void,
) {
  const currentOption = await getOption();
  return [currentOption, optionStorawge.watch(callback)];
}
