import React from 'react';
import type { Chapter } from '../types/lms';

interface ChaptersProps {
  chapters: Chapter[];
  activeChapterId: number | null;
  onSelectChapter: (chapter: Chapter) => void;
}



export const Chapters: React.FC<ChaptersProps> = ({
  chapters,
  activeChapterId,
  onSelectChapter,
}) => {
  
  return (
    <ul className="space-y-1 pl-2">
      {chapters.map((chapter) => {
        const isActive = activeChapterId === chapter.id;
        const isCompleted =
          chapter.completed === true ||
          chapter.completed === "true";
        return (
          <li key={chapter.id}>
            <button
              onClick={() => onSelectChapter(chapter)}
              className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="text-xs">
                  {isCompleted ? (
                    <span className="text-emerald-500 font-bold">✓</span>
                  ) : (
                    <span className="text-gray-400">○</span>
                  )}
                </span>
                <span className="truncate">{chapter.title}</span>
              </div>
             
            </button>
          </li>
        );
      })}
    </ul>
  );
};