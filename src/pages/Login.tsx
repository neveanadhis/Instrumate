import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { apiFetch } from "../api/api";
// import { apiFetch } from "../api/api";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiFetch("http://localhost:8000/auth/login/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        navigate("/home");
      } else {
        alert("Login failed");
      }
    } catch (error: any) {
      alert("Login failed");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex min-h-[80vh] w-full max-w-6xl mx-auto bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-[#EBE9E0]"
    >
      {/* Left Side: Form */}
      <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
        <div className="max-w-sm mx-auto w-full">
          <h1 className="text-4xl font-[800] text-[#2D1A4A] mb-2">Welcome Back</h1>
          <p className="text-[#514B5C]/60 mb-8">Please enter your details</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-transparent focus-within:border-[#5E3BEE] transition-all">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-[#514B5C] mb-1">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent outline-none text-[#2D1A4A] font-medium"
                placeholder="Enter username"
              />
            </div>

            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-transparent focus-within:border-[#5E3BEE] transition-all">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-[#514B5C] mb-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none text-[#2D1A4A] font-medium"
                placeholder="••••••••"
              />
            </div>

            <button className="w-full bg-[#5E3BEE] text-white font-bold py-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
              Continue
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#514B5C]">
            New to Instrumate? <Link to="/signup" className="text-[#5E3BEE] font-bold">Create Account</Link>
          </p>
        </div>
      </div>

      {/* Right Side: 3D Illustration */}
      <motion.div 
        layoutId="auth-image"
        className="hidden md:flex w-1/2 bg-gradient-to-br from-[#E9E4FF] to-[#FAF9F6] items-center justify-center p-12"
      >
        <img 
          src="https://illustrations.popsy.co/blue/studying.svg" 
          alt="Secure Login" 
          className="w-full max-w-md drop-shadow-2xl"
        />
      </motion.div>
    </motion.div>
  );
};

export default Login;