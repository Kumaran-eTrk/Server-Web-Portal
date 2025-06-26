/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useEffect } from "react";
import { UserAgentApplication } from "msal";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import api from "../../../interceptors";
import { useRangeContext } from "../../../contexts/range-context";
import { AuthContext } from "../../../contexts/authguard-context/Index";
import { toast } from "react-toastify";

const Login: React.FC = () => {
  const {
    setRole,
    setTokenCredential,
    tokenCredential,
    setUsername,
    setDomain,
    setProjects,
    setUserId,
    setDivisions,
  }: any = useRangeContext();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  // Ensure authContext is defined
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { initializeAuth } = authContext;
  const handleToken = async () => {
    const dataToPost = {
      token: tokenCredential,
    };

    try {
      const response = await api.post(`/getusertoken`, dataToPost);

      const { accessToken, refreshToken } = response.data.data;
      const decoded = jwtDecode(accessToken);

      const {
        user_role,
        username,
        domain,
        userid,
        division,
        project,
        mail,
      }: any = decoded;
      const rolesArray = user_role.split(",");

      setUsername(username);

      setDomain(domain);
      setUserId(userid);
      setDivisions(division);
      setProjects(project);
      setRole(user_role);
      localStorage.setItem("username", username);
      localStorage.setItem("accesstoken", accessToken);
      localStorage.setItem("refreshtoken", refreshToken);
      localStorage.setItem("userid", userid);
      localStorage.setItem("division", division);

      localStorage.setItem("project", project);

      localStorage.setItem("user_role", user_role);
      localStorage.setItem("domain", domain);
      navigate("/dashboard");
      initializeAuth();
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(`Error: ${error.response.data.error}`, {
          autoClose: 2000,
        });
      }
    }
  };

  useEffect(() => {
    if (tokenCredential !== null) {
      handleToken();
    }
  }, [tokenCredential]);

  const loginWithAzureAD = () => {
    const azureConfig = {
      clientId: import.meta.env.VITE_AZURE_CLIENTID,
      redirectUri: import.meta.env.VITE_REDIRECT_URL,
      authority: import.meta.env.VITE_AZURE_AUTHORITY,
      scopes: ["user.read"],
    };
    const userAgentApplication = new UserAgentApplication({
      auth: {
        clientId: azureConfig.clientId,
        redirectUri: azureConfig.redirectUri,
        authority: azureConfig.authority,
      },
    });

    userAgentApplication
      .loginPopup({
        scopes: azureConfig.scopes,
      })
      .then((response: { idToken: { rawIdToken: any } }) => {
        setTokenCredential(response.idToken.rawIdToken);
      })
      .catch((error: any) => {
        console.error("Login failed:", error);
      });
  };

  return (
    <div>
      {import.meta.env.VITE_AZURE == "TRUE" ? (
        <button onClick={loginWithAzureAD}>Sign In</button>
      ) : (
        ""
      )}
    </div>
  );
};

export default Login;
