import { defineContentScript, injectScript } from '#imports';
import { extractHelp, matchCosenseUrl } from '@/utils/cosense';
import {
  isCosenseLinesChangedMessage,
  isCosensePageLoadedMessage,
} from '@/utils/message';
import { setCosenseHelp, setCosensePages } from '@/utils/storage/cosenseHelp';
import { getOption } from '@/utils/storage/option';

export default defineContentScript({
  matches: ['https://scrapbox.io/*'],
  main() {
    const [project] = matchCosenseUrl(window.location.href);
    if (!project) return;
    getOption().then((option) => {
      const targetProjects = option.autoImportProjects || [];
      if (!targetProjects.includes(project)) return;

      window.addEventListener('message', async (event) => {
        if (isCosensePageLoadedMessage(event.data)) {
          const cosense = event.data.payload.cosense;
          const pages = cosense.Project.pages.map((page) => page.title);
          if (pages.length > 0) {
            await setCosensePages(cosense.Project.name, pages);
          }
          const page = cosense.Page.title;
          const lines = cosense.Page.lines;
          if (!page || !lines || lines.length === 0) return;
          const helps = extractHelp(
            window.location.href,
            lines.map((line) => line.text),
          );
          console.log('Extracted helps:', helps);
          setCosenseHelp(project, page, helps);
        }

        if (isCosenseLinesChangedMessage(event.data)) {
          console.log('Cosense lines changed');
          const cosense = event.data.payload.cosense;
          const lines = cosense.Page.lines;
          const helps = extractHelp(
            window.location.href,
            lines?.map((line) => line.text) || [],
          );
          if (!cosense.Page.title) return;
          setCosenseHelp(project, cosense.Page.title, helps);
        }
      });

      injectScript('/main-world.js', { keepInDom: true });
    });
  },
});
