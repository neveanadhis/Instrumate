import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../../../../components/PageWrapper";
import { apiFetch } from "../../../../../api/api";
import { useParams } from "react-router-dom";
import SignAvatar from "../../../../../components/SignAvatar";


const ChapterContentPage: React.FC = () => {
    const { chapterId } = useParams<{ chapterId: string }>();
    const [chapterContent, setChapterContent] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // interface TranslationResponse {
    //   translated_sentences: string[]; // Add this if your backend returns an array of sentences
    //   original_sentences: string[]; // Add this if you want to show the original sentences too
    //   words: string[]; // Add this if your backend returns an array of individual words
    //   // add any animation data properties here too if needed
    // }
    
    // interface AnimationResponse {
    //   animation_data: MpLandmark[][];
    // }

    const navigate = useNavigate();

    useEffect(() => {
        if (chapterId) {
            getChapterContent();
        } else {
            setErrorMessage("Chapter ID is missing in the URL.");
        }
    }, [chapterId]);

    const getChapterContent = async () => {
        try {
            const response = await apiFetch(`http://localhost:8000/api/lms/chapters/${chapterId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to fetch chapter content');
            }

            const content = await response.json();
            setChapterContent(content);
        } catch (error) {
            console.error('Error fetching chapter content:', error);
            setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    };

    if (errorMessage) {
        return (
            <PageWrapper>
                {errorMessage && (
                    <div className="p-6 text-red-500 bg-red-50 rounded-2xl border border-red-200">
                        <p className="font-semibold">Failed to load chapter content</p>
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                )}
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            {chapterContent && (
                <div className="p-6 bg-white rounded-2xl border border-gray-200">
                    <h1 className="text-2xl font-bold mb-4">{chapterContent.title}</h1>
                    <p className="text-gray-700">{chapterContent.content_filepath}</p>
                </div>
            )}

        </PageWrapper>
    );
};

export default ChapterContentPage;