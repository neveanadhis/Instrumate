import api from "../api/axios";

import type {
  Course,
  Chapter,
} from "../types/lms";

export const lmsService = {

  // ==========================================================
  // Courses
  // ==========================================================

  // GET /api/lms/courses/
  getCourses: async (): Promise<Course[]> => {
    const response = await api.get<Course[]>(
      "/api/lms/courses/"
    );

    return response.data;
  },

  // GET /api/lms/courses/<id>/
  getCourseDetail: async (
    courseId: number
  ): Promise<Course> => {
    const response = await api.get<Course>(
      `/api/lms/courses/${courseId}/`
    );

    return response.data;
  },

  // ==========================================================
  // Modules
  // ==========================================================

  // GET /api/lms/modules/?course_id=<courseId>
  getModules: async (courseId: number) => {
    const response = await api.get(
      "/api/lms/modules/",
      {
        params: {
          course_id: courseId,
        },
      }
    );

    return response.data;
  },

  // GET /api/lms/modules/<id>/
  getModule: async (moduleId: number) => {
    const response = await api.get(
      `/api/lms/modules/${moduleId}/`
    );

    return response.data;
  },

  // ==========================================================
  // Chapters
  // ==========================================================

  // GET /api/lms/chapters/?module_id=<moduleId>
  getChapters: async (
    moduleId: number
  ): Promise<Chapter[]> => {
    const response = await api.get<Chapter[]>(
      "/api/lms/chapters/",
      {
        params: {
          module_id: moduleId,
        },
      }
    );

    return response.data;
  },

  // GET /api/lms/chapters/<id>/
  getChapter: async (
    chapterId: number
  ): Promise<Chapter> => {
    const response = await api.get<Chapter>(
      `/api/lms/chapters/${chapterId}/`
    );

    return response.data;
  },

  // ==========================================================
  // Words
  // ==========================================================

  // GET /api/lms/words/?chapter_id=<chapterId>
  getWords: async (chapterId: number) => {
    const response = await api.get(
      "/api/lms/words/",
      {
        params: {
          chapter_id: chapterId,
        },
      }
    );

    return response.data;
  },

  // ==========================================================
  // Course Progress
  // ==========================================================

  // GET /api/lms/course_progress/
  getCourseProgress: async () => {
    const response = await api.get(
      "/api/lms/course_progress/"
    );

    return response.data;
  },

  // POST /api/lms/course_progress/
  updateCourseProgress: async (
    courseId: number,
    moduleId: number,
    chapterId: number
  ) => {
    const response = await api.post(
      "/api/lms/course_progress/",
      {
        course: courseId,
        current_module: moduleId,
        current_chapter: chapterId,
      }
    );

    return response.data;
  },

  // ==========================================================
  // Completed Courses
  // ==========================================================

  // GET /api/lms/completed_courses/
  getCompletedCourses: async () => {
    const response = await api.get(
      "/api/lms/completed_courses/"
    );

    return response.data;
  },

  // POST /api/lms/completed_courses/
  markCourseCompleted: async (data: any) => {
    const response = await api.post(
      "/api/lms/completed_courses/",
      data
    );

    return response.data;
  },
};

export default lmsService;