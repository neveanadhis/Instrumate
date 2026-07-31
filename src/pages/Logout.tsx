import React, {useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api";


  // If "Logout" export is a function that performs logout (returns void),
  // wrap it in a component so it can be used as a route element.


const Logout = () => {
  // Clear the token from localStorage

    const navigate = useNavigate();
    useEffect(() => {
        handleLogout();
    }, []);

    const handleLogout = async () => {
        try {
            const response = await apiFetch("http://localhost:8000/auth/logout/", {
                method: "POST",

            });
            if (!response.ok) {
                throw new Error("Failed to logout");
            }
            const data = await response.json();
            console.log(data);

            // Redirect to login page
            // window.location.href = "/login";
            navigate("/login");
        } catch (error) {
            console.error("Error during logout:", error);
        }

    };  
    return null; // You can return null since this component doesn't render anything
    }
export default Logout;