import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../../api/axios";
import PageWrapper from "../../../../../components/PageWrapper";
import SignAvatar from "../../../../../components/SignAvatar";

interface ChapterContent {
  id?: string | number;
  title: string;
  content_filepath?: string;
  [key: string]: any;
}

const ChapterContentPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const [chapterContent, setChapterContent] = useState<ChapterContent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (chapterId) {
      getChapterContent();
    } else {
      setErrorMessage("Chapter ID is missing in the URL.");
      setLoading(false);
    }
  }, [chapterId]);

  const getChapterContent = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get<ChapterContent>(`api/lms/chapters/${chapterId}/`);
      const content = response.data;

      // If there is a media file attached, fetch its text content
      if (content.content_filepath) {
        try {
          const fileResponse = await api.get<string>(
            `api/lms/media/${content.content_filepath}`,
            { responseType: "text" }
          );
          content.content_filepath = fileResponse.data;
        } catch (fileError) {
          console.warn("Could not fetch media content file directly:", fileError);
        }
      }

      setChapterContent(content);
    } catch (error: any) {
      console.error("Error fetching chapter content:", error);
      const detail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        (error instanceof Error ? error.message : "Failed to fetch chapter content");
      setErrorMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  if (errorMessage) {
    return (
      <PageWrapper>
        <div className="p-6 m-6 text-red-500 bg-red-50 rounded-2xl border border-red-200">
          <p className="font-semibold">Failed to load chapter content</p>
          <p className="text-sm">{errorMessage}</p>
          <p className="text-sm mt-2">
            <u>
              <button
                type="button"
                className="text-red-500 hover:underline cursor-pointer"
                onClick={() => navigate(-1)}
              >
                ← Go back
              </button>
            </u>
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="p-6">
        <div className="flex flex-col min-h-screen bg-[#FAF9F6] font-['Outfit',sans-serif]">
          <main className="flex justify-center py-5 px-6 flex-1 gap-4">
            <div className="flex flex-col max-w-[920px] w-full">
              <div className="flex items-center justify-between px-4 pb-3 pt-5">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="text-sm font-medium text-[#5E3BEE] hover:underline"
                >
                  ← Back to Chapters
                </button>
              </div>

              {loading ? (
                <div className="p-4 text-slate-500">Loading content...</div>
              ) : chapterContent ? (
                <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-sm mt-4">
                  <h1 className="text-2xl font-bold mb-4 text-[#2D1A4A]">
                    {chapterContent.title}
                  </h1>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {chapterContent.content_filepath}
                  </p>
                  
                  {/* Optional SignAvatar hook ready for animation playback */}
                  {/* <div className="mt-6">
                    <SignAvatar />
                  </div> */}
                </div>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ChapterContentPage;