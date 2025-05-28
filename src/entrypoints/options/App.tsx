import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getOption, setOption } from '@/utils/storage/option';
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
    <div className="w-md m-auto py-10 flex flex-col gap-4">
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
        <ul className="list-disc pl-6 text-sm flex flex-col gap-1">
          {autoImportProjects.map((project) => (
            <li key={project}>
              <span className="flex flex-row items-center gap-2">
                <span>{project}</span>
                <X
                  className="size-4 text-red-500 hover:text-red-200 hover:cursor-pointer"
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
