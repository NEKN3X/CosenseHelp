import { browser, defineBackground } from '#imports';
import { isSearchWithDefaultEngineMessage } from '@/utils/message';

export default defineBackground(() => {
  console.log('Background script initialized');
  browser.runtime.onMessage.addListener(async (message) => {
    if (isSearchWithDefaultEngineMessage(message)) {
      await browser.search.query({
        text: message.payload.query,
        disposition: message.payload.disposition,
      });
    }
  });
});
