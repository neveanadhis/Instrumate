import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Course } from "../../types/lms";
import { lmsService } from "../../services/lmsService";

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await lmsService.getCourses();
        setCourses(data);
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        Loading catalog...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        Course Catalog
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {course.title}
              </h2>

              <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                {course.description}
              </p>
            </div>

            <Link
              to={`/courses/${course.id}`}
              className="mt-6 block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition"
            >
              Enter Classroom
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};