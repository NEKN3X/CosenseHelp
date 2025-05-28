import { Browser, browser } from '#imports';
import { SuggestCommandItem } from '@/components/SuggestCommandItem';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import {
  activeTabHelpAtom,
  activeUrlAtom,
  commandInputAtom,
  CommandPage,
  commandPageAtom,
  commandPagesAtom,
  cosenseStorageAtom,
  expandedCommandAtom,
  filteredSuggestsAtom,
  glossaryAtom,
  webStorageAtom,
} from '@/hooks/atom';
import { makeCosenseUrl } from '@/utils/cosense';
import { createSearchWithDefaultEngineMessage } from '@/utils/message';
import {
  openUrlInCurrentTab,
  openUrlInNewBackgroundTab,
  openUrlInNewTab,
  openUrlInNewWindow,
} from '@/utils/open';
import { watchCosenseHelp } from '@/utils/storage/cosenseHelp';
import { getGlossary } from '@/utils/storage/glossary';
import { getOption } from '@/utils/storage/option';
import {
  removeWebHelp,
  setWebHelp,
  updateWebHelp,
  watchWebHelp,
} from '@/utils/storage/webHelp';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CirclePlus,
  CircleX,
  CornerDownLeft,
  ExternalLink,
  FilePlus,
  Globe,
  MessageCircleQuestion,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { isHotkeyPressed } from 'react-hotkeys-hook';

function App() {
  const [commandInput, setCommandInput] = useAtom(commandInputAtom);
  const setWebHelpStorage = useSetAtom(webStorageAtom);
  const setCosenseStorage = useSetAtom(cosenseStorageAtom);
  const suggests = useAtomValue(filteredSuggestsAtom);
  const setCommandPages = useSetAtom(commandPagesAtom);
  const commandPage = useAtomValue(commandPageAtom);
  const expandedCommand = useAtomValue(expandedCommandAtom);
  const [activeUrl, setActiveUrl] = useAtom(activeUrlAtom);
  const [newPageProject, setNewPageProject] = useState('');
  const activeTabHelp = useAtomValue(activeTabHelpAtom);
  const [edittingCommand, setEditingCommand] = useState<string>('');
  const setGlossary = useSetAtom(glossaryAtom);

  function goBackComamndPage() {
    setCommandPages((prev) => prev.slice(0, -1));
    setCommandInput('');
  }
  function goForwardCommandPage(next: CommandPage) {
    setCommandPages((prev) => [...prev, next]);
  }
  function openUrlWithModifier(url: string) {
    if (isHotkeyPressed(['ctrl', 'shift'])) openUrlInNewWindow(url);
    else if (isHotkeyPressed('ctrl')) openUrlInNewTab(url);
    else if (isHotkeyPressed('shift')) openUrlInNewBackgroundTab(url);
    else openUrlInCurrentTab(url);
    window.close();
  }

  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs.length === 0) return;
      if (!tabs[0].url) return;
      setActiveUrl(tabs[0].url);
    });
    getOption().then((option) => {
      setNewPageProject(option.newPageProject);
    });
    getGlossary().then(setGlossary);
  }, []);

  useEffect(() => {
    const [promise, unwatch] = watchWebHelp(setWebHelpStorage);
    Promise.resolve(promise);
    return unwatch;
  }, []);

  useEffect(() => {
    const [promise, unwatch] = watchCosenseHelp(setCosenseStorage);
    Promise.resolve(promise);
    return unwatch;
  }, []);

  return (
    <>
      <Command
        className="h-[492px] w-md"
        shouldFilter={false}
        loop
        onKeyDown={(e) => {
          if (
            (e.key === 'Escape' && commandPage !== 'TOP') ||
            (e.key === 'Escape' && commandInput.length > 0) ||
            (e.key === 'Backspace' && commandInput.length === 0)
          ) {
            setCommandInput('');
            e.preventDefault();
            goBackComamndPage();
          }
        }}
      >
        <CommandInput
          value={commandInput}
          onValueChange={setCommandInput}
          placeholder={
            commandPage === 'TOP' ? 'ページを検索する' : 'Helpfeel記法'
          }
          icon={
            commandPage !== 'TOP' && (
              <>
                <ChevronLeft className="size-4 shrink-0 opacity-50" />
                <MessageCircleQuestion className="size-4 shrink-0 opacity-50" />
              </>
            )
          }
          autoFocus
        />
        <CommandList className="max-h-[460px]">
          {commandPage === 'TOP' && suggests.length > 0 && (
            <CommandGroup heading="ページを開く">
              {suggests.map((suggest) => (
                <SuggestCommandItem
                  key={`suggest-${suggest.type}-${suggest.title}-${suggest.url}`}
                  suggest={suggest}
                  onSelect={() => openUrlWithModifier(suggest.url)}
                />
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading="コマンド">
            {commandPage === 'TOP' && (
              <>
                {commandInput.length === 0 && (
                  <CommandItem
                    onSelect={() => goForwardCommandPage('ADD_HELP')}
                  >
                    <MessageCircleQuestion />
                    <span>このページのヘルプを追加する</span>
                    <CommandShortcut>
                      <ChevronRight />
                    </CommandShortcut>
                  </CommandItem>
                )}
                {commandInput.length > 0 && (
                  <>
                    <CommandItem
                      onSelect={() => {
                        let disposition: Browser.search.Disposition =
                          'CURRENT_TAB';
                        if (isHotkeyPressed(['ctrl', 'shift'])) {
                          disposition = 'NEW_WINDOW';
                        } else if (
                          isHotkeyPressed('ctrl') ||
                          isHotkeyPressed('shift')
                        ) {
                          disposition = 'NEW_TAB';
                        }
                        browser.runtime.sendMessage(
                          createSearchWithDefaultEngineMessage(
                            commandInput,
                            disposition,
                          ),
                        );
                        window.close();
                      }}
                    >
                      <Globe />
                      <span>検索エンジンで検索する</span>
                      <CommandShortcut>
                        <ExternalLink />
                      </CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      onSelect={() =>
                        openUrlWithModifier(
                          makeCosenseUrl(newPageProject, commandInput),
                        )
                      }
                    >
                      <FilePlus />
                      <span>新しいページを作成する</span>
                      <CommandShortcut>
                        <ExternalLink />
                      </CommandShortcut>
                    </CommandItem>
                  </>
                )}
              </>
            )}
            {commandPage === 'ADD_HELP' && (
              <CommandItem
                onSelect={() => {
                  setWebHelp(activeUrl, commandInput);
                  goBackComamndPage();
                  setCommandInput('');
                }}
                disabled={expandedCommand.length === 0}
              >
                <CirclePlus />
                <span>ヘルプを追加する</span>
                <CommandShortcut>
                  <CornerDownLeft />
                </CommandShortcut>
              </CommandItem>
            )}
            {commandPage === 'EDIT_HELP' && (
              <>
                <CommandItem
                  onSelect={() => {
                    updateWebHelp(activeUrl, edittingCommand, commandInput);
                    goBackComamndPage();
                    setCommandInput('');
                  }}
                  disabled={expandedCommand.length === 0}
                >
                  <CirclePlus />
                  <span>ヘルプを更新する</span>
                  <CommandShortcut>
                    <CornerDownLeft />
                  </CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    removeWebHelp(activeUrl, edittingCommand);
                    goBackComamndPage();
                    setCommandInput('');
                  }}
                >
                  <CircleX />
                  <span>ヘルプを削除する</span>
                  <CommandShortcut>
                    <CornerDownLeft />
                  </CommandShortcut>
                </CommandItem>
              </>
            )}
          </CommandGroup>
          {expandedCommand.length > 0 && (
            <CommandGroup heading="展開後▼">
              {(commandPage === 'ADD_HELP' || commandPage === 'EDIT_HELP') &&
                expandedCommand.map((command) => (
                  <CommandItem
                    disabled
                    key={`expanded-${command}`}
                    value={command}
                    onSelect={() => {}}
                  >
                    {command}
                  </CommandItem>
                ))}
            </CommandGroup>
          )}
          {commandPage === 'TOP' &&
            commandInput.length === 0 &&
            activeTabHelp.length > 0 && (
              <CommandGroup heading="このページのヘルプ">
                {activeTabHelp.map((help) => (
                  <CommandItem
                    key={`help-${help}`}
                    onSelect={() => {
                      goForwardCommandPage('EDIT_HELP');
                      setEditingCommand(help);
                      setCommandInput(help);
                    }}
                  >
                    <CircleHelp />
                    {help}
                    <CommandShortcut>
                      <ChevronRight />
                    </CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
        </CommandList>
      </Command>
    </>
  );
}

export default App;
