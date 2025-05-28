import { expect, test } from 'vitest';
import { extractHelp } from './cosense';

test('Cosense Helpfeel Extraction', () => {
  const lines = [
    'test',
    '',
    'aaa',
    '? これはHelpfeel記法で書かれたヘルプです',
    'aaa',
    '? これはHelpfeel記法で書かれたヘルプ',
    '% open https://scrapbox.io/ExampleProject/ExamplePage',
  ];

  expect(extractHelp('https://scrapbox.io/nekn3x/test', lines)).toEqual([
    {
      url: 'https://scrapbox.io/nekn3x/test',
      helpfeel: 'これはHelpfeel記法で書かれたヘルプです',
    },
    {
      url: 'https://scrapbox.io/ExampleProject/ExamplePage',
      helpfeel: 'これはHelpfeel記法で書かれたヘルプ',
    },
  ]);
});
