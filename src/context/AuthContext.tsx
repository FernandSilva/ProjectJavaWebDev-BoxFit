import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "@/lib/appwrite/api";
import { User } from "@/types";

// Move this to @types/index.ts if you'd prefer
export const INITIAL_USER: User = {
  $id: "",
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  bio: "",
};

interface IContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  sessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
  checkAuthUser: () => Promise<boolean>;
}

const AuthContext = createContext<IContextType>({} as IContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const checkAuthUser = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const currentAccount = await getCurrentUser();

      if (currentAccount) {
        const hydratedUser: User = {
          $id: currentAccount.$id,
          id: currentAccount.$id,
          name: currentAccount.name,
          username: currentAccount.username,
          email: currentAccount.email,
          imageUrl: currentAccount.imageUrl,
          bio: currentAccount.bio,
        };

        setUser(hydratedUser);
        setIsAuthenticated(true);
        setSessionExpired(false);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("[AuthContext] ❌ Error in checkAuthUser:", error?.message || error);

      setUser(null);
      setIsAuthenticated(false);
      setSessionExpired(true);

      // Prevent loop if already on sign-in page
      if (location.pathname !== "/sign-in") {
        navigate("/sign-in", { replace: true });
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cookieFallback = localStorage.getItem("cookieFallback");

    // Appwrite sometimes stores "[]" or undefined when no session exists
    const isInvalidSession =
      cookieFallback === null ||
      cookieFallback === undefined ||
      cookieFallback === "[]";

    if (isInvalidSession) {
      navigate("/sign-in", { replace: true });
    } else {
      checkAuthUser();
    }
  }, []);

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useUserContext = () => useContext(AuthContext);
