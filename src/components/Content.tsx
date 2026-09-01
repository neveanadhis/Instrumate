import React from "react";
import type { Chapter } from "../types/lms";

interface ContentProps {
  chapter: Chapter | null;
  onMarkComplete?: (chapterId: number) => void;
}

export const Content: React.FC<ContentProps> = ({
  chapter,
  onMarkComplete,
}) => {
  if (!chapter) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
        <p className="text-lg">
          Select a lesson from the curriculum sidebar to start learning.
        </p>
      </div>
    );
  }

  const isCompleted =
    chapter.completed === true ||
    chapter.completed === "true";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {chapter.title}
        </h1>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {chapter.is_signable ? (
          <p className="text-gray-700">
            This is a signable lesson.
          </p>
        ) : (
          <p className="text-gray-700">
            This is a standard lesson.
          </p>
        )}
      </div>

      {onMarkComplete && (
        <button
          onClick={() => onMarkComplete(chapter.id)}
          disabled={isCompleted}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium ${
            isCompleted
              ? "bg-emerald-100 text-emerald-800"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isCompleted ? "Completed ✓" : "Mark as Complete"}
        </button>
      )}
    </div>
  );
};