import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "@/lib/appwrite/api";
import { User } from "@/types";

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
  const [isLoading, setIsLoading] = useState(true);
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

      throw new Error("No current user found");
    } catch (error: any) {
      console.error("[AuthContext] ❌ Error in checkAuthUser:", error?.message || error);

      setUser(null);
      setIsAuthenticated(false);
      setSessionExpired(true);

      // Only redirect if not already on sign-in
      if (location.pathname !== "/sign-in") {
        navigate("/sign-in", { replace: true });
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthUser();
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
