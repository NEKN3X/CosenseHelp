import { matchCosenseUrl } from '@/utils/cosense';
import { Suggest } from '@/utils/suggest';
import { CircleHelp, ExternalLink, Link2, StickyNote } from 'lucide-react';
import { CommandItem, CommandShortcut } from './ui/command';

export function SuggestCommandItem({
  suggest,
  onSelect,
}: {
  key: string;
  suggest: Suggest;
  onSelect: (value: string) => void;
}) {
  const [project] = matchCosenseUrl(suggest.url);

  return (
    <CommandItem
      value={`suggest-${suggest.type}-${suggest.title}-${suggest.url}`}
      onSelect={onSelect}
    >
      {suggest.type === 'WEB' && <Link2 />}
      {suggest.type === 'COSENSE_HELP' && <CircleHelp />}
      {suggest.type === 'COSENSE_PAGE' && <StickyNote />}
      <span className="fade-out-right w-full overflow-hidden text-nowrap">
        {project && <span className="text-xs opacity-25">{project}/ </span>}
        <span>{suggest.title}</span>
        {suggest.type !== 'COSENSE_PAGE' && (
          <span className="text-xs opacity-25">
            {' '}
            {suggest.url.replace(/http(s)?:\/\//, '')}
          </span>
        )}
      </span>
      <CommandShortcut>
        <ExternalLink />
      </CommandShortcut>
    </CommandItem>
  );
}
