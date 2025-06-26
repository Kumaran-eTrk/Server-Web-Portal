/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import jwt_decode from "jwt-decode";
import api from "../../interceptors";
import { useRangeContext } from "../../contexts/range-context";
import Login from "../../modules/loginpage/components/LoginPage";

import { EyeIcon, EyeIconOff } from "../../shared/icons";

import { AuthContext } from "../../contexts/authguard-context/Index";
import { toast } from "react-toastify";
import Email from "../../modules/loginpage/components/Email";

interface FormData {
  username: string;
  password: string;
}

interface DecodedToken {
  id: string;
  role: string;
  sub: string;
  domain: string;
}

function LoginPage() {
  const [passwordShown, setPasswordShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    setRole,
    setUsername,
    setDomain,

    setProjects,
    setUserId,
    setDivisions,
    resetpopup,
    setResetPopup,
  }: any = useRangeContext();

  const [user, setUser] = useState<string>("");

  const formRef = useRef<HTMLFormElement>(null);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    reset,
  } = useForm<FormData>({ mode: "onSubmit" });

  const [message, setMessage] = useState("");
  const handlePopup = () => {
    setResetPopup(!resetpopup);
  };
  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true);
  };
  const authContext = useContext(AuthContext);

  // Ensure authContext is defined
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { initializeAuth } = authContext;
  useEffect(() => {
    if (localStorage.getItem("auth")) {
      navigate("/dashboard");
    }
  }, []);

  const Submit = async (e: any) => {
    const data = JSON.stringify(e);
    setUser(e.username);

    try {
      const response = await api.post(`/ldap/login`, data);

      if (response.status === 200) {
        const { accessToken, refreshToken } = response.data;
        const decoded: DecodedToken = jwt_decode(accessToken);

        const { user_role, username, domain, userid, division, project }: any =
          decoded;

        setDomain(domain);
        setUsername(username);

        setUserId(userid);
        setDivisions(division);
        setProjects(project);
        setRole(user_role);
        localStorage.setItem("auth", "true");
        localStorage.setItem("username", username);
        localStorage.setItem("accesstoken", accessToken);

        localStorage.setItem("userid", userid);
        localStorage.setItem("division", division);
        localStorage.setItem("project", project);
        localStorage.setItem("user_role", user_role);
        localStorage.setItem("refreshtoken", refreshToken);
        navigate("/dashboard");
        initializeAuth();
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(`Error: ${error.response.data.error}`, {
          autoClose: 2000,
        });
      }
      setMessage("Invalid Username or password");
      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-96 bg-white p-6 shadow rounded-xl">
          <div className="flex items-center justify-center p-4">
            <img src="./Login_Logo.png" className="w-36" alt="Kumaran Logo" />
          </div>
          <form ref={formRef} onSubmit={handleSubmit(Submit)}>
            {import.meta.env.VITE_DB_AUTH == "TRUE" ? (
              <div className="mb-4">
                <input
                  {...register("username", {
                    required: "field is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "invalid email address",
                    },
                  })}
                  style={{ borderColor: errors.username ? "red" : "" }}
                  className="w-full px-5 py-2 mt-2 rounded-md border placeholder-gray-500 text-md focus:outline-none   focus:bg-white"
                  type="text"
                  id="username"
                  placeholder="Email"
                />
                {errors.username && (
                  <span className=" text-red-500 mt-2 ml-2">
                    {errors.username.message}
                  </span>
                )}
              </div>
            ) : (
              <div className="mb-4">
                <input
                  {...register("username", {
                    required: "field is required",
                  })}
                  style={{ borderColor: errors.username ? "red" : "" }}
                  className="w-full px-5 py-2 mt-2 rounded-md border placeholder-gray-500 text-md focus:outline-none   focus:bg-white"
                  type="text"
                  id="username"
                  placeholder="Username"
                />
                {errors.username && (
                  <span className=" text-red-500 mt-2 ml-2">
                    {errors.username.message}
                  </span>
                )}
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center justify-between w-full px-5 py-2 rounded-md border placeholder-gray-500 text-md  ">
                <input
                  {...register("password", {
                    required: "field is required",
                    minLength: {
                      value: 8,
                      message: "Password must have at least 8 characters",
                    },
                  })}
                  style={{ borderColor: errors.password ? "red" : "" }}
                  className="placeholder-gray-500 text-md focus:outline-none   focus:bg-white"
                  type={passwordShown ? "text" : "password"}
                  id="password"
                  placeholder="Password"
                />
                <i onClick={togglePasswordVisiblity}>
                  {passwordShown ? <EyeIcon /> : <EyeIconOff />}
                </i>
              </div>
              {import.meta.env.VITE_DB_AUTH == "TRUE" ? (
                <div>
                  <h3
                    className="text-blue-500 mt-2 text-right cursor-pointer"
                    onClick={handlePopup}
                  >
                    Forgot Password?
                  </h3>
                </div>
              ) : (
                ""
              )}
              {errors.password && (
                <span className=" text-red-500 mt-2 ml-2">
                  {errors.password.message}
                </span>
              )}
            </div>

            {message && (
              <h2 className="text-red-400 text-left font-medium my-3">
                {message}
              </h2>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-full mt-6 mb-4 bg-emerald-500 text-white py-2 focus:ring-offset-1 rounded-md font-semibold tracking-tight hover:bg-emerald-400"
              >
                Log in
              </button>
            </div>
          </form>
          <div className="inline-flex">
            {import.meta.env.VITE_AZURE == "TRUE" ? (
              <h1 className="text-sm font-medium  px-1 mt-1">
                Sign In With Microsoft?
              </h1>
            ) : (
              ""
            )}
            <button className="text-blue-500">
              <Login />
            </button>
          </div>
          {resetpopup && (
            <div className="fixed inset-0 z-10 flex items-center justify-center mx-auto p-2 bg-opacity-30  backdrop-blur-sm overflow-y-auto">
              <Email />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default LoginPage;
