import React, { useState } from 'react';
import type { Module, Chapter } from '../types/lms';
import { Chapters } from './Chapters';

interface ModulesProps {
  modules: Module[];
  activeChapterId: number | null;
  onSelectChapter: (chapter: Chapter) => void;
}

export const Modules: React.FC<ModulesProps> = ({
  modules,
  activeChapterId,
  onSelectChapter,
}) => {
  const [openModuleIds, setOpenModuleIds] = useState<number[]>(
    modules.map((m) => m.id) // Default all open, or pass [modules[0]?.id]
  );

  const toggleModule = (id: number) => {
    setOpenModuleIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-3">
      {modules.map((module, index) => {
        const isOpen = openModuleIds.includes(module.id);
        return (
          <div key={module.id} className="border border-gray-100 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full flex items-center justify-between p-3 bg-gray-50/80 hover:bg-gray-100/80 transition-colors text-left font-medium text-gray-800 text-sm"
            >
              <span className="truncate">
                Module {index + 1}: {module.name}
              </span>
              <span className="text-xs text-gray-400 ml-2">
                {isOpen ? '▲' : '▼'}
              </span>
            </button>

            {isOpen && (
              <div className="p-2">
                <Chapters
                  chapters={module.chapters}
                  activeChapterId={activeChapterId}
                  onSelectChapter={onSelectChapter}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};