import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback
} from "react";
import "@/App.css";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate
} from "react-router-dom";
import axios from "axios";
import {
    Toaster
} from "@/components/ui/sonner";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancel from "@/pages/PaymentCancel";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

// Helper to format API errors
export const formatApiError = (detail) => {
    if (detail == null) return "Something went wrong. Please try again.";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail))
        return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
    if (detail && typeof detail.msg === "string") return detail.msg;
    return String(detail);
};

// Auth Provider
export const AuthProvider = ({
    children
}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            const {
                data
            } = await axios.get(`${API}/auth/me`, {
                withCredentials: true
            });
            setUser(data);
        } catch {
            setUser(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email, password) => {
        const {
            data
        } = await axios.post(`${API}/auth/login`, {
            email,
            password
        }, {
            withCredentials: true
        });
        setUser(data);
        return data;
    };

    const register = async (email, password, name, username) => {
        const {
            data
        } = await axios.post(`${API}/auth/register`, {
            email,
            password,
            name,
            username
        }, {
            withCredentials: true
        });
        setUser(data);
        return data;
    };

    const logout = async () => {
        await axios.post(`${API}/auth/logout`, {}, {
            withCredentials: true
        });
        setUser(false);
    };

    const refreshUser = async () => {
        await checkAuth();
    };

    return ( <
        AuthContext.Provider value = {
            {
                user,
                loading,
                login,
                register,
                logout,
                refreshUser
            }
        } > {
            children
        } <
        /AuthContext.Provider>
    );
};

// Protected Route
const ProtectedRoute = ({
    children,
    adminOnly = false
}) => {
    const {
        user,
        loading
    } = useAuth();

    if (loading) {
        return ( <
            div className = "min-h-screen bg-[#050505] flex items-center justify-center" >
            <
            div className = "w-8 h-8 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin" / >
            <
            /div>
        );
    }

    if (!user) {
        return <Navigate to = "/login"
        replace / > ;
    }

    if (adminOnly && user.role !== "admin") {
        return <Navigate to = "/dashboard"
        replace / > ;
    }

    return children;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({
    children
}) => {
    const {
        user,
        loading
    } = useAuth();

    if (loading) {
        return ( <
            div className = "min-h-screen bg-[#050505] flex items-center justify-center" >
            <
            div className = "w-8 h-8 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin" / >
            <
            /div>
        );
    }

    if (user) {
        return <Navigate to = {
            user.role === "admin" ? "/admin" : "/dashboard"
        }
        replace / > ;
    }

    return children;
};

function App() {
    return ( <
            AuthProvider >
            <
            BrowserRouter >
            <
            Toaster position = "top-right"
            richColors / >
            <
            Routes >
            <
            Route path = "/"
            element = { < Landing / >
            }
            /> <
            Route path = "/login"
            element = { < PublicRoute > < Login / > < /PublicRoute>} / >
                <
                Route path = "/register"
                element = { < PublicRoute > < Register / > < /PublicRoute>} / >
                    <
                    Route path = "/dashboard"
                    element = { < ProtectedRoute > < Dashboard / > < /ProtectedRoute>} / >
                        <
                        Route path = "/admin"
                        element = { < ProtectedRoute adminOnly > < AdminDashboard / > < /ProtectedRoute>} / >
                            <
                            Route path = "/payment/success"
                            element = { < ProtectedRoute > < PaymentSuccess / > < /ProtectedRoute>} / >
                                <
                                Route path = "/payment/cancel"
                                element = { < ProtectedRoute > < PaymentCancel / > < /ProtectedRoute>} / >
                                    <
                                    Route path = "*"
                                    element = { < Navigate to = "/"
                                        replace / >
                                    }
                                    /> <
                                    /Routes> <
                                    /BrowserRouter> <
                                    /AuthProvider>
                                );
                            }

                            export default App;