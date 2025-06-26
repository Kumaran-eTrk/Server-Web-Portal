import React, { useEffect } from "react";
import { useRangeContext } from "../../../../../contexts/range-context";

import api from "../../../../../interceptors";
import { toast } from "react-toastify";

import "../../../../../../index.css";
type Item = {
  projectName?: string;
};

function AddProject() {
  // Define handleClose function if it's needed
  const { setProjectPopup }: any = useRangeContext();
  const [projects, setProjects] = React.useState([]);
  const [projectInput, setProjectInput] = React.useState<string>("");
  const handleClosePopup = () => {
    setProjectPopup(false);
  };

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await api.get("/adminscreen/getprojects");
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    };

    fetchHolidays();
  }, []);
  const handleSaveChange = async () => {
    try {
      if (!projectInput) {
        toast.error("Please fill all the fields ", {
          autoClose: 2000,
          position: "top-center",
        });
        return;
      }

      const newHoliday: Item = {
        projectName: projectInput,
      };

      const response = await api.post(`/adminscreen/createproject`, newHoliday);

      if (response.status === 200) {
        const responses = await api.get("/adminscreen/getprojects");
        setProjects(responses.data);
        setProjectInput("");
        toast.success("Project added successfully ", { autoClose: 2000 });
        handleClosePopup();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        toast.error("Data already exists", {
          autoClose: 2000,
          position: "top-center",
        });
      } else {
        console.error("Error in posting data:", error);
        toast.error("Failed to add project ", { autoClose: 2000 });
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
   
    if (/^[a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(value)) {
      setProjectInput(value);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black opacity-50 z-10"></div>
      <div className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-x-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4">
                    Add Project
                  </h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="mb-4 flex flex-col">
                      <label
                        htmlFor="holiday"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        Project
                      </label>
                      <input
                        type="text"
                        name="holiday"
                        id="holiday"
                        placeholder="Enter your project"
                        required
                        value={projectInput}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                onClick={handleSaveChange}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save
              </button>
              <button
                onClick={handleClosePopup}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* <ToastContainer /> */}
    </>
  );
}

export default React.memo(AddProject);
