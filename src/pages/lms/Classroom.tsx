import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import type { Course, Chapter, Module } from "../../types/lms";

import { lmsService } from "../../services/lmsService";
import { Modules } from "../../components/Modules";
import { Content } from "../../components/Content";

export const Classroom: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    const loadClassroom = async () => {
      try {
        setLoading(true);

        const id = Number(courseId);

        // Get course
        const courseData = await lmsService.getCourseDetail(id);

        // Get modules belonging to this course
        const modules = await lmsService.getModules(id);

        // Get chapters for each module
        const modulesWithChapters = await Promise.all(
          modules.map(async (module: Module) => {
            const chapters = await lmsService.getChapters(module.id);

            return {
              ...module,
              chapters,
            };
          })
        );

        const completeCourse = {
          ...courseData,
          modules: modulesWithChapters,
        };

        setCourse(completeCourse);

        // Select first chapter
        if (modulesWithChapters[0]?.chapters?.[0]) {
          setActiveChapter(modulesWithChapters[0].chapters[0]);
        }
      } catch (error) {
        console.error("Failed to load classroom:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClassroom();
  }, [courseId]);

  const handleMarkComplete = async (chapterId: number) => {
    if (!courseId || !activeChapter) return;

    try {
      const currentModule = course?.modules?.find(
        (module: Module) =>
          module.chapters.some(
            (chapter: Chapter) => chapter.id === chapterId
          )
      );

      if (!currentModule) return;

      await lmsService.updateCourseProgress(
        Number(courseId),
        currentModule.id,
        chapterId
      );

      setActiveChapter((prev) =>
        prev
          ? {
              ...prev,
              is_completed: true,
            }
          : null
      );
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        Loading classroom...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-12 text-center text-red-500">
        Course not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">

      {/* Top Bar */}
      <div className="h-12 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <Link
          to="/courses"
          className="text-sm font-medium text-gray-500 hover:text-indigo-600"
        >
          ← Back to Courses
        </Link>

        <span className="text-sm font-semibold text-gray-800 truncate">
          {course.title}
        </span>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50">
          <Content
            chapter={activeChapter}
            onMarkComplete={handleMarkComplete}
          />
        </div>

        {/* Curriculum */}
        <div className="w-full lg:w-80 bg-white border-l border-gray-200 overflow-y-auto p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
            Course Curriculum
          </h2>

          <Modules
            modules={course.modules}
            activeChapterId={activeChapter?.id ?? null}
            onSelectChapter={(chapter) =>
              setActiveChapter(chapter)
            }
          />
        </div>

      </div>
    </div>
  );
};