import { useRef, useState } from "react";
import { CancelIcon, EmailIcon } from "../../../shared/icons";
import { useRangeContext } from "../../../contexts/range-context";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../../../interceptors";

interface FormData {
  email: string;
}

const Email = () => {
  const { resetpopup, setResetPopup }: any = useRangeContext();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    try {
      await api.post(`/forgotpassword`, data);
      setLoading(false);
      toast.success("Email  sent successfully", { autoClose: 2000 });
    } catch (error: any) {
      setLoading(false);
      console.error("Error changing password", error);
      setMessage(error.response.error);
      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
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
            Email Verification
          </h2>
          <p className="text-center">
            Enter your email address and we will <br /> send you instructions to
            reset your password.
          </p>
        </div>

        <div>
          <form ref={formRef} onSubmit={handleSubmit(Submit)}>
            <div className="mb-4">
              <input
                {...register("email", {
                  required: "field is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "invalid email address",
                  },
                })}
                style={{ borderColor: errors.email ? "red" : "" }}
                className="w-full px-5 py-2 mt-2 rounded-md border
               placeholder-gray-500 text-md focus:outline-none focus:border-gray-400 focus:bg-white"
                type="text"
                id="email"
                placeholder="Enter your email"
              />
              {errors.email && (
                <span className=" text-red-500 mt-2 ml-2">
                  {errors.email.message}
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
                className="w-full mt-6 mb-4 bg-emerald-500 text-white py-2 flex justify-center rounded-md font-semibold tracking-tight hover:bg-emerald-400"
              >
                <span className="flex gap-2 items-center">
                  {" "}
                  {loading ? "Sending..." : "Send Email"}{" "}
                  <i>
                    <EmailIcon />
                  </i>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Email;
