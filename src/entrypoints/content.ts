import { defineContentScript, injectScript } from '#imports';
import { extractGlossary, extractHelp, matchCosenseUrl } from '@/utils/cosense';
import {
  CosenseObject,
  isCosenseLayoutChangedMessage,
  isCosenseLinesChangedMessage,
  isCosensePageLoadedMessage,
} from '@/utils/message';
import { setCosenseHelp, setCosensePages } from '@/utils/storage/cosenseHelp';
import { setGlossary } from '@/utils/storage/glossary';
import { getOption } from '@/utils/storage/option';

export default defineContentScript({
  matches: ['https://scrapbox.io/*'],
  main() {
    const [project] = matchCosenseUrl(window.location.href);
    if (!project) return;
    getOption().then((option) => {
      const targetProjects = option.autoImportProjects || [];
      if (!targetProjects.includes(project)) return;

      const onLoadCosensePage = async (cosense: CosenseObject) => {
        // 全ページ
        const pages = cosense.Project.pages
          .filter((page) => page.exists)
          .map((page) => page.title);
        if (pages.length > 0) {
          console.log('Cosense pages loaded:', pages);
          await setCosensePages(cosense.Project.name, pages);
        }

        // 個別ページ
        const page = cosense.Page.title;
        const lines = cosense.Page.lines;
        if (!page || !lines || page === 'new') return;
        const helps = extractHelp(
          window.location.href,
          lines.map((line) => line.text),
        );
        console.log('Extracted helps:', helps);
        setCosenseHelp(project, page, helps);

        // Glossary
        const option = await getOption();
        if (
          cosense.Page.title === 'Glossary' &&
          cosense.Project.name === option.newPageProject
        ) {
          const glossary = extractGlossary(
            lines?.map((line) => line.text) || [],
          );
          setGlossary(glossary);
        }
      };

      window.addEventListener('message', async (event) => {
        if (isCosensePageLoadedMessage(event.data)) {
          onLoadCosensePage(event.data.payload.cosense);
        }

        if (isCosenseLinesChangedMessage(event.data)) {
          console.log('Cosense lines changed');
          const cosense = event.data.payload.cosense;
          const lines = cosense.Page.lines;
          const helps = extractHelp(
            window.location.href,
            lines?.map((line) => line.text) || [],
          );
          if (!cosense.Page.title || cosense.Page.title === 'new') return;
          setCosenseHelp(project, cosense.Page.title, helps);

          // update glossary
          const option = await getOption();
          if (
            cosense.Page.title === 'Glossary' &&
            cosense.Project.name === option.newPageProject
          ) {
            const glossary = extractGlossary(
              lines?.map((line) => line.text) || [],
            );
            setGlossary(glossary);
          }
        }

        if (isCosenseLayoutChangedMessage(event.data)) {
          onLoadCosensePage(event.data.payload.cosense);
        }
      });

      injectScript('/main-world.js', { keepInDom: true });
    });
  },
});
