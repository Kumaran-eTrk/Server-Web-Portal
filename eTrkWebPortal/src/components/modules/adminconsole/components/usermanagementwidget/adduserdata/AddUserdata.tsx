import * as React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../../../../index.css";
import api from "../../../../../interceptors";
import { useRangeContext } from "../../../../../contexts/range-context";
import { useUserDataRangeContext } from "../../../../../contexts/user-data-context";

import { ChevronDownIcon } from "../../../../../shared/icons";
import { TimeRange } from "../../../../../shared/dropdown/Timedropdown";

export type Item = {
  email: string;
  displayName: string;
  reportingInto: string;
  division: string;
  location: string;
  jobTitle: string;
  reportingIntoMail: string;
  branch: string;
  projectId: string;
  localADDomain: string;
  localADUserName: string;
  password: string;
  id: string;
  shiftStartTime: string;
  shiftEndTime: string;
};
const AddUserdata = () => {
  const {
   
    setUserDataPopup,
    timePickerValue1,
    timePickerValue2,
  
  }: any = useRangeContext();

  const {
    setSelectedProject,
    selectedProjectId,
    setSelectedProjectId,
   
  }: any = useUserDataRangeContext();


  const [user, setUser] = React.useState<Item[]>([]);
  const [searchValue, setSearchValue] = React.useState('');
  const [projects, setProjects] = React.useState<
    { id: string; projectName: string }[]
  >([]);
  const [userData, setUserData] = React.useState({
    displayName: '',
    jobTitle: '',
    email: '',
    division: '',
    projectId: '',
    projectName: '',
    location: '',
    branch: '',
    reportingInto: '',
    reportingIntoMail: '',
    localADDomain: '',
    localADUserName: '',
    ShiftStartTime: '',
    ShiftEndTime: ''
  });
  const [selectedProjectName, setSelectedProjectName] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  
  React.useEffect(() => {
    const handleOutsideClick = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [showDropdown]);
  const handleProjectClick = (projectName: string) => {
    setSelectedProjectName(projectName);
    setShowDropdown(false);

    // Assuming you need to update the selected project ID here
    const selectedProject = projects.find(
      (project) => project.projectName === projectName
    );
    if (selectedProject) {
      setSelectedProject(selectedProject.id);
      setSelectedProjectId(selectedProject.id);
    } else {
      setSelectedProject("");
      setSelectedProjectId("");
    }
  };
  

  
  const handleClosePopup = () => {
    setUserDataPopup(false);
  };

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/adminscreen/getprojects");
        if (response.data && response.data.length > 0) {
          setProjects(response.data);
        }
      } catch (error) {
        toast.error("Error in creating  user");
      }
    };
    fetchProjects();
  }, []);


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSaveChange = async () => {
    try {
  

      const newUser = {
        ...userData,
        projectId: selectedProjectId,
        ShiftStartTime: timePickerValue1,
        ShiftEndTime : timePickerValue2,
        password: "", // Add any additional fields if needed
      };

      const response = await api.post(`/adminscreen/users`, newUser);
      if (response.status === 200) {
        toast.success("User added successfully", { autoClose: 2000 });

        // Clear form after successful submission
        setUserData({
          displayName: '',
          jobTitle: '',
          email: '',
          division: '',
          projectId: '',
          projectName: '',
          location: '',
          branch: '',
          reportingInto: '',
          reportingIntoMail: '',
          localADDomain: '',
          localADUserName: '',
          ShiftStartTime: '',
          ShiftEndTime: ''
        });
        
        setUserDataPopup(false);
        const response = await api.get("/adminscreen/users");
        setUser(response.data);
      }
      
    } catch (error: any) {
     
      // Check if the error response contains a message from the server
    if (error.response && error.response.data && error.response.data.error) {
      toast.error(`Failed to add user: ${error.response.data.error}`, {
        autoClose: 2000,
      });
    } 
    
      
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
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-x-hidden shadow-xl  transform transition-all  sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center w-full  sm:mt-0 sm:ml-2 sm:text-left">
                  <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-2">
                    Add EmployeeData
                  </h3>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="mb-4 flex flex-col  ">
                      <label
                        htmlFor="displayName"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        name="displayName"
                        id="displayName"
                        value={userData.displayName}
                        pattern="[A-Za-z0-9]"
                        onChange={handleChange}
                        className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                      />
                    </div>
                    <div className="mb-4 flex flex-col">
                      <label
                        htmlFor="date"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        Email<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="email"
                        id="email"
                        value={userData.email}
                        onChange={handleChange}
                        className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                      />
                    </div>
                    <div className="mb-4 flex flex-col">
                      <label
                        htmlFor="date"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        Job Title<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="jobTitle"
                        id="jobTitle"
                        value={userData.jobTitle}
                        onChange={handleChange}
                        className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                      />
                    </div>
                    <div className="mb-4 flex flex-col">
                      <label
                        htmlFor="date"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        Location<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        value={userData.location}
                        onChange={handleChange}
                        className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                      />
                    </div>
                    <div className="mb-4 flex flex-col">
                      <label
                        htmlFor="division"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        Division<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="division"
                        id="division"
                        value={userData.division}
                        onChange={handleChange}
                        className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                      />
                    </div>
                    <div className="mb-4 flex flex-col">
                      <label
                        htmlFor="project"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        Project<span className="text-red-500">*</span>
                      </label>

                      <div className="relative" ref={dropdownRef}>
                        <input
                          id="project"
                          name="project"
                          type="text"
                          placeholder="Project Name"
                          value={selectedProjectName}
                          onChange={(e) => {
                            setSearchValue(e.target.value);
                            setSelectedProjectName(e.target.value);
                          }}
                          onFocus={handleDropdownToggle}
                          className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                        />
                        <button
                          onClick={handleDropdownToggle}
                          className="absolute top-0 right-0 h-full px-2 py-2  rounded-r"
                        >
                          <ChevronDownIcon />
                        </button>
                        {showDropdown && (
                          <div className="absolute bg-white border border-gray-300 mt-1 rounded-md shadow-lg w-full z-10">
                            {projects
                              .filter((project) =>
                                project.projectName
                                  .toLowerCase()
                                  .includes(searchValue.toLowerCase())
                              )
                              .map((project) => (
                                <div
                                  key={project.id}
                                  onClick={() =>
                                    handleProjectClick(project.projectName)
                                  }
                                  className="p-2 cursor-pointer hover:bg-gray-100"
                                >
                                  {project.projectName}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-4 flex flex-col">
                      <label
                        htmlFor="date"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        Branch<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="branch"
                        id="branch"
                        value={userData.branch}
                        onChange={handleChange}
                        className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                      />
                    </div>
                    <div className="mb-4 flex flex-col">
                      <label
                        htmlFor="date"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        Reporting Into<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="reportingInto"
                        id="reportingIno"
                        value={userData.reportingInto}
                        onChange={handleChange}
                        className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                      />
                    </div>
                    <div className="mb-4 flex flex-col">
                      <label
                        htmlFor="date"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        ReportingIntoMail<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="reportingIntoMail"
                        id="reportingIntoMail"
                        value={userData.reportingIntoMail}
                        onChange={handleChange}
                        className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                      />
                    </div>
                    <div className="mb-4 flex flex-col">
                      <label
                        htmlFor="date"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        UserName<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="localADUserName"
                        id="localADUserName"
                        value={userData.localADUserName}
                        onChange={handleChange}
                        className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                      />
                    </div>

                    <div className="mb-4 flex flex-col">
                      <label
                        htmlFor="date"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        Domain<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="localADDomain"
                        id="localADDomain"
                        value={userData.localADDomain}
                        onChange={handleChange}
                        className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                      />
                    </div>

                    <div className="mb-4 flex flex-col">
                      <label
                        htmlFor="date"
                        className="block text-sm font-semibold text-gray-700 mb-1.5"
                      >
                        Shift Start Time<span className="text-red-500">*</span>
                      </label>

                      <TimeRange onTimePickerChange="timepicker2" />
                    </div>

                    <div className="mb-4 flex flex-col">
                      <label
                        htmlFor="date"
                        className="block text-sm font-semibold text-gray-700 mb-1.5"
                      >
                        Shift End Time<span className="text-red-500">*</span>
                      </label>
                      <TimeRange onTimePickerChange="timepicker3" />
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
    </>
  );
};

export default React.memo(AddUserdata);
