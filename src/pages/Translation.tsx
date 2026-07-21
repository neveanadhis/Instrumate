import { useRef, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import SignAvatar from "../components/SignAvatar";
import type { MpLandmark } from "../demo/RPMThreeMpPose";


interface TranslationResponse {
  translated_sentences: string[]; // Add this if your backend returns an array of sentences
  original_sentences: string[]; // Add this if you want to show the original sentences too
  words: string[]; // Add this if your backend returns an array of individual words
  // add any animation data properties here too if needed
}

interface AnimationResponse {
  animation_data: MpLandmark[][];
}

export default function TranslationPage() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputFile, setInputFile] = useState<File | null>(null);
  // Create a reference to link our button to the hidden input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [translationData, setTranslationData] = useState<TranslationResponse | null>(null);
  const [animationData, setanimationData] = useState<AnimationResponse | null>(null);

  const handleButtonClick = () => {
    // Secretly trigger the file selector dialog box
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInputFile(file);
      console.log("Selected file:", file.name);
    }
  };


  const getAnimationDataFromTranslation = async(translationResponse: TranslationResponse) => {
    // This is where you would convert the translated sentences into the specific format your SignAvatar expects
    // For example, if your SignAvatar needs an array of {x, y, z} coordinates for each sentence, you would do that transformation here.
    // This is a placeholder and should be replaced with your actual logic.
    const translation_words = translationResponse.words
    try {
      const animation_request = await fetch("http://localhost:8000/api/get_animations/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({text: translation_words})
      })
      if(!animation_request.ok){
        const errorData = await animation_request.json();
        throw new Error(errorData.error || "Translation processing failed.");
      }

      const animation_data = await animation_request.json()
      console.log(animation_data)
      setanimationData(animation_data);
    }catch(error){
      console.error(error)
    }
  }
  

  const handleTranslate = async () => {
    if (!inputText && !inputFile) return;

    
    if(inputFile){
      setLoading(true);

      const formData = new FormData();
      
      // 2. Append the file payload (the key must match request.FILES.get("file"))
      formData.append("file", inputFile);
      try {
        // --- STEP 1: Upload & Chunk File ---
        const upload_respond = await fetch("http://localhost:8000/api/upload/", {
          method: "POST",
          body: formData,
        });

        if (!upload_respond.ok) {
          const errorData = await upload_respond.json();
          throw new Error(errorData.error || "File upload and chunking failed.");
        }

        const data = await upload_respond.json();
        console.log("File uploaded successfully. Task ID created:", data.task_id);

        // --- STEP 2: Request Translation via Task ID ---
        const response = await fetch("http://localhost:8000/api/translate/eng_to_ksl/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 'task_id': data.task_id }), 
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Translation processing failed.");
        }

        const translation_data = await response.json();
        console.log("Translation fully complete:", translation_data);
        // Update your state to trigger the 3D Avatar canvas update
        setTranslationData(translation_data); 
        getAnimationDataFromTranslation(translation_data);

      } catch (error) {
        console.error("Pipeline failure:", error);
        // Ideally, update an error state here to show a toast message to the user!
      } finally {
        setLoading(false);
      } 
    }
    else if(inputText){
      setLoading(true);
      try {
        // Replace with your actual backend endpoint
        const response = await fetch("http://localhost:8000/api/translate/eng_to_ksl/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText}),
        });
        // Safe check before parsing JSON
        if (!response.ok) {
          const errorText = await response.json();
          console.error("Server responded with error status:", response.status, errorText);
          return;
        }
        const data = await response.json();
        console.log("Translation response:", data);
        setTranslationData(data); 
        getAnimationDataFromTranslation(data);

      } catch (error) {
        console.error("Network or parsing error occurred:", error);
        } finally {
        setLoading(false);
      }
    } else{
      console.error("Invalid upload type")
    };
  }


  return (
    <PageWrapper>
      <div className="p-6">
        <main className="relative flex min-h-screen flex-col bg-slate-50 overflow-x-hidden font-['Lexend','Noto_Sans',sans-serif]">
          <div className="layout-container flex flex-col flex-grow h-full px-40 py-5">
            <div className="flex flex-col max-w-[960px] w-full mx-auto">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <p className="text-[#0c151d] text-[32px] font-bold leading-tight min-w-72">
                  Translate Text to KSL
                </p>
              </div>

              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text to translate"
                    className="form-input w-full resize-none rounded-xl min-h-36 p-[15px] text-base border border-[#cddcea] bg-slate-50 text-[#0c151d] placeholder:text-[#4574a1] focus:outline-none"
                  />
                </label>
              </div>

              <div className="flex px-4 py-3 gap-3 justify-start">

                {/* 1. The Real (but completely hidden) File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" 
                  accept=".pdf,.txt" // Optional: restrict file formats
                />
                <button
                  type="button"
                  onClick={handleButtonClick}
                  className="rounded-full h-10 px-4 bg-[#e6edf4] text-[#0c151d] text-sm font-bold hover:bg-[#d8e4f0] transition-colors"
                >
                  Upload File (Optional)
                </button>

                {/* 3. Optional: Show the user the name of the file they chose */}
                {inputFile && (
                  <span className="text-xs text-[#4574a1] truncate max-w-[150px]">
                    📎 {inputFile.name}
                  </span>
                )}
                <button 
                  onClick={handleTranslate}
                  disabled={loading}
                  className="rounded-full h-10 px-6 bg-[#359dff] text-white text-sm font-bold disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Translate"}
                </button>
              </div>

              <h2 className="text-[#0c151d] text-[22px] font-bold px-4 pb-3 pt-5">
                Translation Output
              </h2>

              <div className="p-4">
                <div
                  className="relative flex items-center justify-center bg-[#0c151d] aspect-video rounded-xl overflow-hidden"
                >
                  {/* Three.js Canvas Container */}
                  <div className="absolute inset-0 w-full h-full">
                    <SignAvatar animationData={animationData}/>
                  </div>

                  {!animationData && !loading && (
                    <button className="z-10 flex items-center justify-center size-16 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[#0c151d] text-base text-center px-4 pt-1 pb-3">
                {translationData?.translated_sentences?.map((sentence, index) => (
                  <span key={index}>{sentence}</span>
                )) || "Your translation will appear here."}
              </p>

              <p className="text-[#4574a1] text-sm text-center px-4 pt-1 pb-3">
                KSL Supported
              </p>
            </div>
          </div>
        </main>
      </div>
    </PageWrapper>
  );
}