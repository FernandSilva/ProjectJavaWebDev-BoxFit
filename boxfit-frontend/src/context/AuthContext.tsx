import { useNavigate } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import { IUser } from "@/types";
import { getCurrentUser } from "@/lib/appwrite/api";

// ============================================================================
// Default User & Initial Context State
// ============================================================================
export const INITIAL_USER: IUser = {
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  bio: "",
};

const INITIAL_STATE = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  sessionExpired: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  setSessionExpired: () => {},
  checkAuthUser: async () => false as boolean,
};

// ============================================================================
// Context Type
// ============================================================================
type IContextType = {
  user: IUser;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setSessionExpired: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

// ============================================================================
// Create Context
// ============================================================================
const AuthContext = createContext<IContextType>(INITIAL_STATE);

// ============================================================================
// Provider
// ============================================================================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // ==========================================================================
  // Main Authentication Checker
  // ==========================================================================
  const checkAuthUser = async () => {
    setIsLoading(true);
    console.log("🔍 Checking authentication status...");

    try {
      const currentUser = await getCurrentUser();

      if (currentUser && (currentUser._id || currentUser.id)) {
        console.log("✅ Authenticated user found:", currentUser);

        // Map MongoDB `_id` to `id`
        setUser({
          id: currentUser._id || currentUser.id,
          name: currentUser.name || "",
          username: currentUser.username || "",
          email: currentUser.email || "",
          imageUrl: currentUser.imageUrl || "",
          bio: currentUser.bio || "",
        });

        setIsAuthenticated(true);
        setSessionExpired(false);
        return true;
      } else {
        console.warn("⚠️ No active session or invalid user response:", currentUser);
        setIsAuthenticated(false);
        return false;
      }
    } catch (err: any) {
      console.error("❌ checkAuthUser() error:", err.message || err);
      setSessionExpired(true);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // Auto-check session on mount
  // ==========================================================================
  useEffect(() => {
    console.log("🚀 AuthProvider mounted — checking user session...");

    // Session cookie fallback (legacy Appwrite support)
    const cookieFallback = localStorage.getItem("cookieFallback");
    if (!cookieFallback || cookieFallback === "[]") {
      console.log("⚠️ No valid cookieFallback found. Redirecting to /sign-in...");
      navigate("/sign-in");
      return;
    }

    checkAuthUser();
  }, []);

  // ==========================================================================
  // Context value
  // ==========================================================================
  const value: IContextType = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    sessionExpired,
    setSessionExpired,
    checkAuthUser,
  };

  // ==========================================================================
  // Render Provider
  // ==========================================================================
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================
export const useUserContext = () => useContext(AuthContext);
