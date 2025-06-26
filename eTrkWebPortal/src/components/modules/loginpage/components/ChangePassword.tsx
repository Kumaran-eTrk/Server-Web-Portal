import { useRef, useState } from "react";
import { useRangeContext } from "../../../contexts/range-context";
import { CancelIcon, EyeIcon, EyeIconOff } from "../../../shared/icons";
import { useForm } from "react-hook-form";
import api from "../../../interceptors";
import { toast } from "react-toastify";

interface FormData {
  currentpassword: string;
  newpassword: string;
  confirmnewpassword: string;
}

const ChangePassword = () => {
  const { resetpopup, setResetPopup }: any = useRangeContext();
  const [passwordShown, setPasswordShown] = useState(false);
  const [conformpasswordShown, setConformPasswordShown] = useState(false);
  const [currentpasswordShown, setCurrentPasswordShown] = useState(false);
  const [message, setMessage] = useState("");

  const handlePopup = () => {
    setResetPopup(!resetpopup);
  };
  const formRef = useRef<HTMLFormElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ mode: "onSubmit" });

  const Submit = async (e: any) => {
    const data = JSON.stringify(e);
    reset();

    try {
      const response = await api.post(`/changepassword`, data);

      toast.success("password changed successfully", { autoClose: 2000 });
    } catch (error: any) {
      console.error("Error changing password", error);
      setMessage(error.response.data.error);
      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };

  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true);
  };
  const CurrenttogglePasswordVisiblity = () => {
    setCurrentPasswordShown(currentpasswordShown ? false : true);
  };
  const ConfirmtogglePasswordVisiblity = () => {
    setConformPasswordShown(conformpasswordShown ? false : true);
  };

  return (
    <>
      <div className="bg-white rounded-sm shadow-md px-5 py-7 w-96 flex  flex-col gap-3">
        <div
          className="flex items-center justify-end cursor-pointer"
          onClick={handlePopup}
        >
          <CancelIcon />
        </div>

        <div>
          <h2 className="text-center text-2xl font-bold my-4">
            Reset Password
          </h2>
        </div>

        <div>
          <form ref={formRef} onSubmit={handleSubmit(Submit)}>
            <div className="mb-4">
              <div className="flex items-center justify-between w-full px-5 py-2 rounded-md border placeholder-gray-500 text-md ">
                <input
                  {...register("currentpassword", {
                    required: "Field is required",
                    minLength: {
                      value: 8,
                      message: "Password must have at least 8 characters",
                    },
                    pattern: {
                      value: /[!@#$%^&*(),.?":{}|<>]/,
                      message:
                        "Password must include at least one special character",
                    },
                  })}
                  style={{ borderColor: errors.currentpassword ? "red" : "" }}
                  className="placeholder-gray-500 text-md focus:outline-none focus:border-gray-400 focus:bg-white"
                  type={currentpasswordShown ? "text" : "password"}
                  id="currentpassword"
                  placeholder="current password"
                />
                <i onClick={CurrenttogglePasswordVisiblity}>
                  {currentpasswordShown ? <EyeIcon /> : <EyeIconOff />}
                </i>
              </div>
              {errors.currentpassword && (
                <span className=" text-red-500 mt-2 ml-2">
                  {errors.currentpassword.message}
                </span>
              )}
            </div>

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
                      message:
                        "Password must include at least one special character",
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
                    required: "field is required",
                    minLength: {
                      value: 8,
                      message: "Password must have at least 8 characters",
                    },
                    pattern: {
                      value: /[!@#$%^&*(),.?":{}|<>]/,
                      message:
                        "Password must include at least one special character",
                    },
                  })}
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
      </div>
    </>
  );
};

export default ChangePassword;
