import jwt_decode from "jwt-decode";
import { ReactNode, createContext, useEffect, useState } from "react";

interface AuthContextType {
  email: string;
  admin: string;
  manager: string;
  sysadmin: string;
  initializeAuth: any;
}

// Create the context with the correct type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState<string>('');
  const [admin, setAdmin] = useState<string>('false');
  const [manager, setManager] = useState<string>('false');
  const [sysadmin, setSysadmin] = useState<string>('false');

  // Function to decode the access token and retrieve roles and email
  const getDetailsFromToken = (token: any) => {
    const decoded: any = jwt_decode(token);

    const { mail, user_role } = decoded;

    const rolesArray = user_role.split(",");
    const isAdmin = rolesArray.includes("Admin");
    const isManager = rolesArray.includes("Manager");
    const isSysadmin = rolesArray.includes("System Admin");

    return { mail, isAdmin, isManager, isSysadmin };
  };

  // Function to retrieve the token from storage (e.g., localStorage)
  const retrieveToken = () => {
    return localStorage.getItem('accesstoken');
  };

  // Function to initialize the context state
  const initializeAuth = () => {
    const token = retrieveToken();
    if (token) {
      const { mail, isAdmin, isManager, isSysadmin } = getDetailsFromToken(token);
      setEmail(mail);

      if (isManager && isAdmin) {
        setAdmin("true");
        setManager("true");
      } else if (isSysadmin) {
        setSysadmin("true");
      } else if (isAdmin) {
        setAdmin("true");
      } else if (isManager) {
        setManager("true");
      } else {
        setAdmin("false");
        setManager("false");
      }
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ email,admin,manager, sysadmin, initializeAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
