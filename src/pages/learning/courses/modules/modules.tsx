import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../api/axios";
import PageWrapper from "../../../../components/PageWrapper";

interface Module {
  id: string | number;
  name?: string;
  title?: string;
  [key: string]: any;
}

const ModulesPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [modules, setModules] = useState<Module[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (courseId) {
      getModuleData();
    } else {
      setErrorMessage("Course ID is missing in the URL.");
      setLoading(false);
    }
  }, [courseId]);

  const handleModuleClick = (moduleId: string | number) => {
    navigate(`chapters/${moduleId}`);
  };

  const getModuleData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get<Module[]>("api/lms/modules/", {
        params: { course_id: courseId },
      });
      setModules(response.data);
    } catch (error: any) {
      console.error("Error fetching module data:", error);
      const detail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        (error instanceof Error ? error.message : "Failed to fetch module data");
      setErrorMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  if (errorMessage) {
    return (
      <div className="p-6 m-6 text-red-500 bg-red-50 rounded-2xl border border-red-200">
        <p className="font-semibold">Failed to load modules</p>
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
              <div className="flex items-center justify-between px-4 pb-3 pt-5">
                <h2 className="text-[28px] font-bold">Modules</h2>
                <button
                  type="button"
                  onClick={() => navigate("/courses")}
                  className="text-sm font-medium text-[#5E3BEE] hover:underline"
                >
                  ← Back to Courses
                </button>
              </div>

              {loading ? (
                <div className="p-4 text-slate-500">Loading modules...</div>
              ) : modules.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md mx-auto mt-6">
                  <p className="text-lg font-semibold text-[#2D1A4A] mb-1">
                    No modules found
                  </p>
                  <p className="text-sm text-[#514B5C]">
                    There are currently no modules available for this course.
                  </p>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {modules.map((module) => (
                    <div
                      key={module.id}
                      onClick={() => handleModuleClick(module.id)}
                      className="group relative bg-white p-8 rounded-[3.5rem] border-2 border-transparent hover:border-[#D1FAE5] hover:bg-[#D1FAE5]/30 cursor-pointer transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
                    >
                      <div className="w-16 h-16 bg-[#D1FAE5] rounded-3xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                        {/* Icon or Image */}
                      </div>
                      <h3 className="text-[22px] font-bold text-[#2D1A4A] mb-2">
                        Module: {module.name || module.title}
                      </h3>
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

export default ModulesPage;