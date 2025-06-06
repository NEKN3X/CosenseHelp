import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  exportCosenseHelp,
  exportCosensePage,
  importCosenseHelp,
  importCosensePage,
} from '@/utils/storage/cosenseHelp';
import { exportGlossary, importGlossary } from '@/utils/storage/glossary';
import {
  exportOption,
  getOption,
  importOption,
  setOption,
} from '@/utils/storage/option';
import { exportWebHelp, importWebHelp } from '@/utils/storage/webHelp';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function App() {
  const [autoImportProjects, setAutoImportProjects] = useState<string[]>([]);
  const newPageProjectInputRef = useRef<HTMLInputElement>(null);
  const autoImportProjectInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getOption().then((option) => {
      setAutoImportProjects(option.autoImportProjects);
      newPageProjectInputRef.current!.value = option.newPageProject || '';
    });
  }, []);

  return (
    <div className="m-auto flex w-md flex-col gap-4 py-10">
      <div className="flex flex-col gap-2">
        <Label className="font-bold">エクスポート/インポート</Label>
        <div className="flex flex-row gap-2">
          <Button
            onClick={() => {
              const cosensePage = exportCosensePage();
              const cosenseHelp = exportCosenseHelp();
              const glossary = exportGlossary();
              const option = exportOption();
              const webHelp = exportWebHelp();
              Promise.all([
                cosensePage,
                cosenseHelp,
                glossary,
                option,
                webHelp,
              ]).then((data) => {
                const blob = new Blob(
                  [
                    JSON.stringify({
                      cosensePage: data[0],
                      cosenseHelp: data[1],
                      glossary: data[2],
                      option: data[3],
                      webHelp: data[4],
                    }),
                  ],
                  {
                    type: 'application/json',
                  },
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'cosense-help.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              });
            }}
            className="w-24 hover:cursor-pointer"
          >
            エクスポート
          </Button>
          <Button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = async (event) => {
                const file = (event.target as HTMLInputElement).files?.[0];
                if (!file) return;
                const text = await file.text();
                try {
                  const data = JSON.parse(text);
                  await Promise.all([
                    importCosensePage(data.cosensePage),
                    importCosenseHelp(data.cosenseHelp),
                    importGlossary(data.glossary),
                    importOption(data.option),
                    importWebHelp(data.webHelp),
                  ]);
                  window.location.reload();
                } catch (error) {
                  console.error('Invalid file format:', error);
                }
              };
              input.click();
            }}
            className="w-24 hover:cursor-pointer"
          >
            インポート
          </Button>
        </div>
      </div>
      <hr />
      <div className="flex flex-col gap-2">
        <Label className="font-bold">新規ページを作成するプロジェクト</Label>
        <div className="flex flex-row gap-2">
          <Input ref={newPageProjectInputRef} />
          <Button
            onClick={() => {
              setOption({
                newPageProject: newPageProjectInputRef.current?.value || '',
              });
            }}
            className="w-24 hover:cursor-pointer"
          >
            確定
          </Button>
        </div>
      </div>
      <hr />
      <div className="flex flex-col gap-2">
        <Label className="font-bold">
          ヘルプを自動でインポートする対象のプロジェクト
        </Label>
        <div className="flex flex-row gap-2">
          <Input ref={autoImportProjectInputRef} />
          <Button
            onClick={() => {
              const newProject = autoImportProjectInputRef.current?.value || '';
              if (!newProject) return;
              if (autoImportProjects.includes(newProject)) return;
              const updatedProjects = [...autoImportProjects, newProject];
              setAutoImportProjects(updatedProjects);
              autoImportProjectInputRef.current!.value = ''; // 入力フィールドをクリア
              setOption({ autoImportProjects: updatedProjects });
            }}
            className="w-24 hover:cursor-pointer"
          >
            追加
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="font-bold">
          自動インポートの対象プロジェクト一覧
        </Label>
        <ul className="flex list-disc flex-col gap-1 pl-6 text-sm">
          {autoImportProjects.map((project) => (
            <li key={project}>
              <span className="flex flex-row items-center gap-2">
                <span>{project}</span>
                <X
                  className="size-4 text-red-500 hover:cursor-pointer hover:text-red-200"
                  onClick={() => {
                    const updatedProjects = autoImportProjects.filter(
                      (p) => p !== project,
                    );
                    setAutoImportProjects(updatedProjects);
                    setOption({ autoImportProjects: updatedProjects });
                  }}
                />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
