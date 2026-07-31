import React, { useEffect, useState } from "react";
import { data, useNavigate } from "react-router-dom";
import { apiFetch } from "../../../api/api"; // Adjust the path as necessary
import PageWrapper from "../../../components/PageWrapper";

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getCourseData();
  }, []);

  const handleCourseClick = (courseId: string) => {
  
    navigate(`modules/${courseId}`);
  };

  const getCourseData = async () => {
    try {
      // Use your new helper instead of raw 'fetch'
      const response = await apiFetch('http://localhost:8000/api/lms/courses/', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData)
        throw new Error(errorData.detail || 'Failed to fetch course data');
      }
    const data = await response.json();
    setCourses(data);
    }catch(error){
      console.error('Error fetching course data:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }

  if (errorMessage) {
    return (
      <div className="p-6 text-red-500 bg-red-50 rounded-2xl border border-red-200">
        <p className="font-semibold">Failed to load courses</p>
        <p className="text-sm">{errorMessage}</p>
        <p className="text-sm-"><u><a href="/login" className="text-red-500 hover:underline" onClick={() => navigate("/login")}>Navigate to login page</a></u></p>
      </div>
    );
  }


  return (
    <PageWrapper>
      <div className="p-6">
        <div className="flex flex-col min-h-screen bg-[#FAF9F6] font-['Outfit',sans-serif]">
          <main className="flex justify-center py-5 px-6 flex-1 gap-4">
            <div className="flex flex-col max-w-[920px] w-full">
              <h2 className="text-[28px] font-bold px-4 pb-3 pt-5">
                Courses
              </h2>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Example Course Card */}
                
                { courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => handleCourseClick(course.id)}
                    className="group relative bg-white p-8 rounded-[3.5rem] border-2 border-transparent hover:border-[#D1FAE5] hover:bg-[#D1FAE5]/30 cursor-pointer transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
                  >
                    <div className="w-16 h-16 bg-[#D1FAE5] rounded-3xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                      {/* Icon or Image */}
                    </div>
                    <h3 className="text-[22px] font-bold text-[#2D1A4A] mb-2">Course: {course.title}</h3>
                    <p className="text-[#514B5C] text-base">
                      {course.description}
                    </p>
                  </div>
                ))}
                {/* Add more course cards as needed */}
              </div>
            </div>
          </main>
        </div>
      </div>
    </PageWrapper>
  );
}

export default CoursesPage;