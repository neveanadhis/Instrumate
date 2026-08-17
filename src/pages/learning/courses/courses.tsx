import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import PageWrapper from "../../../components/PageWrapper";

interface Course {
  id: string | number;
  title: string;
  description: string;
  [key: string]: any;
}

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getCourseData();
  }, []);

  const handleCourseClick = (courseId: string | number) => {
    navigate(`modules/${courseId}`);
  };

  const getCourseData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get<Course[]>("api/lms/courses/");
      setCourses(response.data);
    } catch (error: any) {
      console.error("Error fetching course data:", error);
      const detail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        (error instanceof Error ? error.message : "Failed to fetch course data");
      setErrorMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  if (errorMessage) {
    return (
      <div className="p-6 m-6 text-red-500 bg-red-50 rounded-2xl border border-red-200">
        <p className="font-semibold">Failed to load courses</p>
        <p className="text-sm">{errorMessage}</p>
        <p className="text-sm mt-2">
          <u>
            <button
              type="button"
              className="text-red-500 hover:underline cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Navigate to login page
            </button>
          </u>
        </p>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="p-6">
        <div className="flex flex-col min-h-screen bg-[#FAF9F6] font-['Outfit',sans-serif]">
          <main className="flex justify-center py-5 px-6 flex-1 gap-4">
            <div className="flex flex-col max-w-[920px] w-full">
              <h2 className="text-[28px] font-bold px-4 pb-3 pt-5">Courses</h2>

              {loading ? (
                <div className="p-4 text-slate-500">Loading courses...</div>
              ) : (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => handleCourseClick(course.id)}
                      className="group relative bg-white p-8 rounded-[3.5rem] border-2 border-transparent hover:border-[#D1FAE5] hover:bg-[#D1FAE5]/30 cursor-pointer transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
                    >
                      <div className="w-16 h-16 bg-[#D1FAE5] rounded-3xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                        {/* Icon or Image */}
                      </div>
                      <h3 className="text-[22px] font-bold text-[#2D1A4A] mb-2">
                        Course: {course.title}
                      </h3>
                      <p className="text-[#514B5C] text-base">{course.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CoursesPage;