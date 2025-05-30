import { defineUnlistedScript } from '#imports';
import { debounce } from '@/utils/debounce';
import {
  CosenseObject,
  createCosenseLayoutChangedMessage,
  createCosenseLinesChangedMessage,
  createCosensePageLoadedMessage,
} from '@/utils/message';

type CosenseEventType =
  | 'lines:changed'
  | 'page:changed'
  | 'project:changed'
  | 'layout:changed';
declare global {
  interface Window {
    cosense?: CosenseObject & {
      on: (type: CosenseEventType, callback: () => void) => void;
    };
  }
}

export default defineUnlistedScript(() => {
  window.addEventListener('load', () => {
    const cosense = window.cosense;
    if (!cosense) return;
    window.postMessage(createCosensePageLoadedMessage(cosense));

    const [f] = debounce(() => {
      const lines = window.cosense?.Page.lines;
      const _cosense = window.cosense;
      if (!lines || !_cosense) return;
      window.postMessage(createCosenseLinesChangedMessage(_cosense));
    }, 1000);
    cosense.on('lines:changed', () => {
      f([]);
    });
    cosense.on('layout:changed', () => {
      const _cosense = window.cosense;
      if (!_cosense) return;
      window.postMessage(createCosenseLayoutChangedMessage(_cosense));
    });
  });
});
