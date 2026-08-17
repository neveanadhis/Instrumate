import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        localStorage.removeItem("token");
        await api.post("auth/logout/", {});
        console.log("Logged out successfully");
      } catch (error: any) {
        console.error("Logout error:", error.response?.data || error.message);
      } finally {
        navigate("/login");
      }
    };

    handleLogout();
  }, [navigate]);

  return null;
};

export default Logout;