import React, {useEffect} from "react";
import { useNavigate } from "react-router-dom";


const Logout = () => {
  // Clear the token from localStorage

    const navigate = useNavigate();
    useEffect(() => {
        handleLogout();
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:8000/auth/logout/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // <-- CRITICAL: Allows cookie deletion
            });
            if (!response.ok) {
                throw new Error("Failed to logout");
            }
            const data = await response.json();
            console.log(data);
            localStorage.removeItem("access_token");
            // Redirect to login page
            // window.location.href = "/login";
            navigate("/login");
        } catch (error) {
            console.error("Error during logout:", error);
        }

    return null; // You can return null since this component doesn't render anything
    }
    }
export default Logout;