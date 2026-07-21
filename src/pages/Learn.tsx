import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sprout, 
  BookOpenCheck, 
  Rocket, 
  ArrowRight, 
  Star
} from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const LearningPage: React.FC = () => {

  const navigate = useNavigate();
  
  const handleComingSoon = (level: string) => {
    MySwal.fire({
      title: <span className="font-['Outfit'] font-bold text-[#2D1A4A]">Coming Soon!</span>,
      html: (
        <p className="font-['Outfit'] text-[#514B5C]">
          The <span className="font-bold text-[#5E3BEE]">{level}</span> curriculum is currently being 
          reviewed by KSL experts. Check back shortly!
        </p>
      ),
      icon: "info",
      iconColor: "#5E3BEE",
      confirmButtonText: "Got it!",
      confirmButtonColor: "#2D1A4A",
      buttonsStyling: true,
      customClass: {
        popup: "rounded-[2.5rem] border-none shadow-2xl",
        confirmButton: "rounded-full px-8 py-3 font-bold",
      },
      showClass: {
        popup: 'animate__animated animate__fadeInUp animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutDown animate__faster'
      }
    });
  };


  return (
    <div className="min-h-screen bg-[#FAF9F6] font-['Outfit',sans-serif] flex flex-col items-center px-6">
      
      {/* --- HEADER --- */}
      <div className="max-w-3xl text-center mb-16 relative">
        <div className="absolute -top-6 -right-10 text-[#5E3BEE] animate-bounce opacity-30">
          <Star size={40} fill="currentColor" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-[800] text-[#2D1A4A] tracking-tighter mb-4">
          Learning <span className="text-[#5E3BEE]">Hub</span>
        </h1>
        <p className="text-[#514B5C] text-xl font-light">
          Structured paths to master <span className="font-bold">Kenyan Sign Language.</span>
        </p>
      </div>

      {/* --- CARDS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">

        
        {/* Beginner */}
        <div 
          onClick={() => navigate("/learning/courses/") }
          className="group relative bg-white p-10 rounded-[3.5rem] border-2 border-transparent hover:border-[#D1FAE5] hover:bg-[#D1FAE5]/30 cursor-pointer transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
        >
          <div className="w-20 h-20 bg-[#D1FAE5] rounded-3xl flex items-center justify-center text-green-600 mb-8 group-hover:scale-110 transition-transform">
            <Sprout size={40} strokeWidth={2.5} />
          </div>
          <h3 className="text-3xl font-[800] text-[#2D1A4A] mb-3">Beginner</h3>
          <p className="text-[#514B5C]/70 mb-8 text-lg font-light">Focus on the KSL alphabet, numbers, and core syntax.</p>
          <div className="flex items-center gap-2 font-bold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Unlock <ArrowRight size={18} />
          </div>
        </div>

        {/* Intermediate */}
        <div 
          onClick={() => handleComingSoon("Intermediate")}
          className="group relative bg-white p-10 rounded-[3.5rem] border-2 border-transparent hover:border-[#FEF3C7] hover:bg-[#FEF3C7]/30 cursor-pointer transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
        >
          <div className="w-20 h-20 bg-[#FEF3C7] rounded-3xl flex items-center justify-center text-yellow-600 mb-8 group-hover:scale-110 transition-transform">
            <BookOpenCheck size={40} strokeWidth={2.5} />
          </div>
          <h3 className="text-3xl font-[800] text-[#2D1A4A] mb-3">Intermediate</h3>
          <p className="text-[#514B5C]/70 mb-8 text-lg font-light">Master common phrases and social conversational signs.</p>
          <div className="flex items-center gap-2 font-bold text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Continue <ArrowRight size={18} />
          </div>
        </div>

        {/* Advanced */}
        <div 
          onClick={() => handleComingSoon("Advanced")}
          className="group relative bg-white p-10 rounded-[3.5rem] border-2 border-transparent hover:border-[#E0E7FF] hover:bg-[#E0E7FF]/30 cursor-pointer transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
        >
          <div className="w-20 h-20 bg-[#E0E7FF] rounded-3xl flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform">
            <Rocket size={40} strokeWidth={2.5} />
          </div>
          <h3 className="text-3xl font-[800] text-[#2D1A4A] mb-3">Advanced</h3>
          <p className="text-[#514B5C]/70 mb-8 text-lg font-light">Professional signing, deaf culture, and legal terminology.</p>
          <div className="flex items-center gap-2 font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Go Pro <ArrowRight size={18} />
          </div>
        </div>

      </div>

      <div className="mt-20 flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-[#5E3BEE] opacity-20"></div>)}
        </div>
        <p className="text-[10px] font-bold text-[#2D1A4A]/30 uppercase tracking-[0.3em]">
          Powered by Instrumate AI Engine
        </p>
      </div>
    </div>
  );
};

export default LearningPage;