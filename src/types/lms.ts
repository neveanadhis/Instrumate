export interface Chapter {
  id: number;
  module: number;
  title: string;
  sort_index: number;
  is_signable: boolean;
  content_filepath: string;
  created_at: string;
  completed?: boolean | "true" | "false" | "pending";
}

export interface Module {
  id: number;
  course: number;
  name: string;
  sort_index: number;
  created_at: string;
  completed?: boolean | "true" | "false" | "pending";
  chapters: Chapter[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  created_at: string;
  modules: Module[];
}

export interface CourseProgression {
  id: number;
  user: number;
  course: number;
  current_module: number;
  current_chapter: number;
  last_entry: string;
}