export type CosenseObject = {
  Project: {
    name: string;
    pages: {
      title: string;
    }[];
  };
  Page: {
    title: string | null;
    lines:
      | {
          text: string;
        }[]
      | null;
  };
};

export type CosensePageLoadedMessage = {
  type: 'cosense-page-loaded';
  payload: {
    cosense: CosenseObject;
  };
};

export type CosenseLinesChangedMessage = {
  type: 'cosense-lines-changed';
  payload: {
    cosense: CosenseObject;
  };
};

function clonseCosenseObject(cosense: CosenseObject): CosenseObject {
  return {
    Project: {
      name: cosense.Project.name,
      pages: cosense.Project.pages.map((page) => ({
        title: page.title,
      })),
    },
    Page: {
      title: cosense.Page.title,
      lines:
        cosense.Page.lines?.map((line) => ({
          text: line.text,
        })) || null,
    },
  };
}

export function isCosensePageLoadedMessage(
  message: unknown,
): message is CosensePageLoadedMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    (message as { type: string }).type === 'cosense-page-loaded'
  );
}
export function createCosensePageLoadedMessage(
  cosense: CosenseObject,
): CosensePageLoadedMessage {
  return {
    type: 'cosense-page-loaded',
    payload: {
      cosense: clonseCosenseObject(cosense),
    },
  };
}

export function isCosenseLinesChangedMessage(
  message: unknown,
): message is CosenseLinesChangedMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    (message as { type: string }).type === 'cosense-lines-changed'
  );
}
export function createCosenseLinesChangedMessage(
  cosense: CosenseObject,
): CosenseLinesChangedMessage {
  return {
    type: 'cosense-lines-changed',
    payload: {
      cosense: clonseCosenseObject(cosense),
    },
  };
}
