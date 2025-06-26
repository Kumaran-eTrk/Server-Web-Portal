import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../interceptors";
import { EyeIcon, EyeIconOff } from "../../../shared/icons";
import jwtDecode from "jwt-decode";
interface FormData {
  newpassword: string;
  confirmnewpassword: string;
}

const ForgotPassword = () => {
  const [passwordShown, setPasswordShown] = useState(false);
  const [conformpasswordShown, setConformPasswordShown] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const[redirect,setRedirect] = useState(false);

  const [token, setToken] = useState("");

  const formRef = useRef<HTMLFormElement>(null);


  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<FormData>({ mode: "onSubmit" });
  const newpassword = useRef({});
  newpassword.current = watch("newpassword", "");
  const [searchParams] = useSearchParams();
  useEffect(() => {
    // Extract the token from the query parameters
    const tokenquery = searchParams.get("q");
    if (tokenquery && tokenquery !== token) {
      setToken(tokenquery);
     
      // Decode the token to extract the email
      try {
        const decoded: any = jwtDecode(tokenquery);
        const { mail }: any = decoded;
        setEmail(mail);
      } catch (error: any) {
        console.error("Invalid token", error);
        setMessage(error.message);
      }
    }
  }, [searchParams, token]);

  const navigate = useNavigate();

  const Submit = async (data: FormData) => {
    reset();
    console.log("click");

    try {
      const response = await api.post("/resetpassword", {
        email,
        token,
        newPassword: data.newpassword,
      });
      setTimeout(() => {
        navigate("/"); // Redirect to login page after successful reset
      }, 3000);
      
      toast.success("password reset successfully", { autoClose: 2000 });
    } catch (error: any) {
      console.error("Error changing password", error);
      setMessage(error.response.data.error);
      setTimeout(() => {
        setMessage("");
      }, 3000);
      toast.error("Error",{ autoClose: 2000 })
      setRedirect(true);
    }
  };

  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true);
  };

  const ConfirmtogglePasswordVisiblity = () => {
    setConformPasswordShown(conformpasswordShown ? false : true);
  };

  return (
    <div className="w-full h-screen bg-white flex items-center justify-center">


       { redirect ?  

      ( <div className="flex items-center flex-col gap-3 p-3 text-center justify-center">
        <img src = './login-timeout.png' className="w-36 h-36 md:w-60 h-60"/>
        <h3 className="text-2xl">Your token is expired,Please click the button to return home page</h3>
        <Link to='/'>
        <button className="bg-blue-500 text-lg text-white px-4 py-1 rounded-md">Login Page</button>
        </Link>
        </div>
      )

     :
     ( <div className="bg-white rounded-sm shadow-md px-5 py-7 w-96 flex  flex-col gap-3">
        <div>
          <h2 className="text-center text-2xl font-bold my-4">
          Reset your password
          </h2>
          <p className="text-center mb-3">Please enter your new password and confirm the new password</p>
        </div>
        <form ref={formRef} onSubmit={handleSubmit(Submit)}>
          <div className="mb-4">
            <div className="flex items-center justify-between w-full px-5 py-2 rounded-md border placeholder-gray-500 text-md ">
              <input
                {...register("newpassword", {
                  required: "Field is required",
                  minLength: {
                    value: 8,
                    message: "Password must have at least 8 characters",
                  },
                  pattern: {
                    value: /[!@#$%^&*(),.?":{}|<>]/,
                    message: 'Password must include at least one special character',
                  },
                })}
                style={{ borderColor: errors.newpassword ? "red" : "" }}
                className="placeholder-gray-500 text-md focus:outline-none focus:border-gray-400 focus:bg-white"
                type={passwordShown ? "text" : "password"}
                id="newpassword"
                placeholder="new password"
              />
              <i onClick={togglePasswordVisiblity}>
                {passwordShown ? <EyeIcon /> : <EyeIconOff />}
              </i>
            </div>
            {errors.newpassword && (
              <span className=" text-red-500 mt-2 ml-2">
                {errors.newpassword.message}
              </span>
            )}
          </div>

          <div className="mb-4">
              <div className="flex items-center justify-between w-full px-5 py-2 rounded-md border placeholder-gray-500 text-md ">
                <input
                  {...register("confirmnewpassword", {
                    required: "Field is required",
                    minLength: {
                      value: 8,
                      message: "Password must have at least 8 characters",
                    },
                    pattern: {
                      value: /[!@#$%^&*(),.?":{}|<>]/,
                      message: 'Password must include at least one special character',
                    },
                    validate: value =>
                      value === newpassword.current || "The passwords do not match"
                  },)}
                  style={{
                    borderColor: errors.confirmnewpassword ? "red" : "",
                  }}
                  className="placeholder-gray-500 text-md focus:outline-none focus:border-gray-400 focus:bg-white"
                  type={conformpasswordShown ? "text" : "password"}
                  id="confirmpassword"
                  placeholder="confirm password"
                />
                <i onClick={ConfirmtogglePasswordVisiblity}>
                  {conformpasswordShown ? <EyeIcon /> : <EyeIconOff />}
                </i>
              </div>

              {errors.confirmnewpassword && (
                <span className=" text-red-500 mt-2 ml-2">
                  {errors.confirmnewpassword.message}
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
              className="w-full mt-6 mb-4 bg-emerald-500 text-white py-2 rounded-md font-semibold tracking-tight hover:bg-emerald-400"
            >
              Update Password
            </button>
          </div>
        </form>
        
      </div>
     )

        }

    </div>
  );
};

export default ForgotPassword;
