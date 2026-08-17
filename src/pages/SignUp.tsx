import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";

const Signup: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("register/", { username, email, password, is_student: !isTeacher, is_teacher: isTeacher });
      navigate("/login");
    } catch (error: any) {
  console.log("Signup error:", error.response?.data);
  alert(JSON.stringify(error.response?.data));
}
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-row-reverse min-h-[80vh] w-full max-w-6xl mx-auto bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-[#EBE9E0]"
    >
      {/* Right Side: Form */}
      <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
        <div className="max-w-sm mx-auto w-full">
          <h1 className="text-4xl font-[800] text-[#2D1A4A] mb-2">Join Us</h1>
          <p className="text-[#514B5C]/60 mb-8">Create your inclusive learning account</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-transparent focus-within:border-[#5E3BEE]">
              <label className="block text-[10px] font-bold text-[#514B5C] mb-1">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-transparent outline-none font-medium" />
            </div>

            <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-transparent focus-within:border-[#5E3BEE]">
              <label className="block text-[10px] font-bold text-[#514B5C] mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent outline-none font-medium" />
            </div>

            <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-transparent focus-within:border-[#5E3BEE]">
              <label className="block text-[10px] font-bold text-[#514B5C] mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent outline-none font-medium" />
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#FAF9F6] rounded-2xl">
              <input type="checkbox" checked={isTeacher} onChange={(e) => setIsTeacher(e.target.checked)} id="t-check" className="accent-[#5E3BEE] w-5 h-5" />
              <label htmlFor="t-check" className="text-sm font-bold text-[#2D1A4A]">I am a teacher</label>
            </div>

            <button className="w-full bg-[#2D1A4A] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#5E3BEE] transition-all">
              Sign Up
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#514B5C]">
            Already have an account? <Link to="/login" className="text-[#5E3BEE] font-bold">Log In</Link>
          </p>
        </div>
      </div>

      {/* Left Side: 3D Illustration */}
      <motion.div 
        layoutId="auth-image"
        className="hidden md:flex w-1/2 bg-gradient-to-br from-[#FFF4E0] to-[#FAF9F6] items-center justify-center p-12"
      >
        <img 
          src="https://illustrations.popsy.co/blue/engineer.svg" 
          alt="Start Learning" 
          className="w-full max-w-md drop-shadow-2xl"
        />
      </motion.div>
    </motion.div>
  );
};

export default Signup;