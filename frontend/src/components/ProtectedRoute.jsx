import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

const ProtectedRoute = ({ children, allowedRole }) => {
    const [status, setStatus] = useState("loading");


    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get("/");

                if (
                    res.data.loggedIn &&
                    (!allowedRole || res.data.role === allowedRole)
                ) {
                    setStatus("allowed");
                } else {
                    setStatus("denied");
                }
            } catch {
                setStatus("denied");
            }
        };

        checkAuth();
    }, [allowedRole]);

    if (status === "loading") return null;

    if (status === "denied") {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
