import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  Input,
  InputOnChangeData,
  Spinner,
  TableCellLayout,
  TableColumnDefinition,
  createTableColumn,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";
import { Search16Regular } from "@fluentui/react-icons";
import * as React from "react";
import { CancelIcon, ChevronDownIcon } from "../../../../../shared/icons";

import api from "../../../../../interceptors";

import { TimePicker } from "@fluentui/react-timepicker-compat";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRangeContext } from "../../../../../contexts/range-context";
import { useUserDataRangeContext } from "../../../../../contexts/user-data-context";
import "../../../../../../index.css";
import { formatCustomStartDate } from "../../../../../lib/Date-Utils";
import { Toggle } from "@fluentui/react/lib/Toggle";
import { IStackTokens, Stack } from "@fluentui/react/lib/Stack";

const stackTokens: IStackTokens = { childrenGap: 5 };

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
  isScreenshot: boolean;
};

const useStyles = makeStyles({
  contentHeader: {
    marginTop: "0",
  },
  root: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("20px"),
    maxWidth: "400px",
    "> div": {
      display: "flex",
      flexDirection: "column",
      ...shorthands.gap("2px"),
    },
  },
  control: {
    maxWidth: "150px",
  },
});

const EditUserDatas = () => {
  const [user, setUser] = React.useState<Item[]>([]);
  const [editModalOpen, setEditModalOpen] = React.useState<boolean>(false);
  const [selecteduser, setSelectedUser] = React.useState<Item | null>(null);
  const [searchValue, setSearchValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const styles = useStyles();
  const [projects, setProjects] = React.useState<
    { id: string; projectName: string }[]
  >([]);
  const { selectedProjectId, setSelectedProjectId }: any =
    useUserDataRangeContext();

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/adminscreen/getprojects");
        if (response.data && response.data.length > 0) {
          setProjects(response.data);
        }
      } catch (error) {
        toast.error("Error in updating user");
      }
    };
    fetchProjects();
  }, []);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [showDropdown, setShowDropdown] = React.useState(false);
  const [selectedProjectName, setSelectedProjectName] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [deletingItemId, setDeletingItemId] = React.useState<string | null>(
    null
  );
  const { setUserDataPopup }: any = useRangeContext();
  const handleOpenPopup = () => {
    setUserDataPopup(true); // Function to set showPopup state to true
  };
  const togglestyles = {
    text: {
      color: "#6b7280",
    },
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/adminscreen/users/${id}`);
      const updatedUser = user.filter((item: { id: string }) => item.id !== id);
      setUser(updatedUser);
      toast.success("User deleted successfully ", { autoClose: 2000 });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user ", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (id: string) => {
    setShowModal(true);
    setDeletingItemId(id);
  };

  const closeModal = () => {
    setShowModal(false);
    setDeletingItemId(null);
  };

  const handleConfirmDelete = () => {
    if (deletingItemId) {
      handleDelete(deletingItemId);
      closeModal();
    }
  };

  const handleProjectClick = (projectName: string, projectId: string) => {
    setSelectedProjectName(projectName);
    setSelectedProjectId(projectId);

    // Update the selecteduser object with the selected projectId
    setSelectedUser((prevState: Item | null) => ({
      ...(prevState as Item), // Cast prevState to Item type
      projectId: projectId,
      projectName: projectName,
    }));
    setShowDropdown(false);
  };
  React.useEffect(() => {
    if (selecteduser && selecteduser.projectId) {
      const selectedProject = projects.find(
        (project) => project.id === selecteduser.projectId
      );
      if (selectedProject) {
        setSelectedProjectName(selectedProject.projectName);
      }
    }
  }, [selecteduser, projects]);

  const handleSave = async () => {
    if (selecteduser) {
      // Add log to check selected project when saving
      await updateHoliday(selecteduser);
      closeEditModal();
      // Reset selected project state
      setSelectedProjectName("");
      setSelectedProjectId("");
    }
  };

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

  React.useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        const response = await api.get("/adminscreen/users");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  const updateHoliday = async (updatedHoliday: Item) => {
    try {
      setLoading(true);

      // Check if the ID is defined and not null
      if (!updatedHoliday.id) {
        console.error("ID is undefined or null");
        return;
      }

      if (!selectedProjectName) {
        toast.error("All field are required");
        return; // Show error if the field is empty
      }

      const url = `/adminscreen/users/${updatedHoliday.id}`;
      const response = await api.put(url, updatedHoliday);

      if (response.status === 200) {
        toast.success("User updated successfully ", { autoClose: 2000 });

        // Refresh the user data after updating
        const updatedResponse = await api.get("/adminscreen/users");
        setUser(updatedResponse.data);
      }
    } catch (error) {
      console.error("Error updating holiday:", error);
      toast.error("Failed to update user ", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selecteduser) {
      setSelectedUser({
        ...selecteduser,
        [e.target.name]: e.target.value,
      });
    }
  };
  const handleToggleChange = (checked: any) => {
    setSelectedUser((prevUser: any) => ({
      ...prevUser,
      isScreenshot: checked,
    }));
  };
  const openEditModal = (holiday: Item) => {
    setSelectedUser(holiday);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setEditModalOpen(false);
  };

  const columns: TableColumnDefinition<Item>[] = [
    createTableColumn<Item>({
      columnId: "User name",
      renderHeaderCell: () => {
        return "User name";
      },
      renderCell: (item: any) => {
        return <TableCellLayout>{item.displayName}</TableCellLayout>;
      },
    }),
    createTableColumn<Item>({
      columnId: "Email",
      renderHeaderCell: () => {
        return "Email";
      },
      renderCell: (item: any) => {
        return (
          <TableCellLayout style={{ wordBreak: "break-all" }}>
            {item.email}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: "Reporting Into",
      renderHeaderCell: () => {
        return "Reporting Into";
      },
      renderCell: (item: any) => {
        return <TableCellLayout>{item.reportingInto}</TableCellLayout>;
      },
    }),
    createTableColumn<Item>({
      columnId: "Reporting Into Mail",
      renderHeaderCell: () => {
        return "Reporting Into Mail";
      },
      renderCell: (item: any) => {
        return (
          <TableCellLayout style={{ wordBreak: "break-all" }}>
            {item.reportingIntoMail}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: "Location",
      renderHeaderCell: () => {
        return "Location";
      },
      renderCell: (item: any) => {
        return <TableCellLayout>{item.location}</TableCellLayout>;
      },
    }),
    createTableColumn<Item>({
      columnId: "Branch",
      renderHeaderCell: () => {
        return "Branch";
      },
      renderCell: (item: any) => {
        return <TableCellLayout>{item.branch}</TableCellLayout>;
      },
    }),
    createTableColumn<Item>({
      columnId: "Job Title",
      renderHeaderCell: () => {
        return "Job Title";
      },
      renderCell: (item: any) => {
        return <TableCellLayout>{item.jobTitle}</TableCellLayout>;
      },
    }),
    createTableColumn<Item>({
      columnId: "Project",
      renderHeaderCell: () => {
        return "Project";
      },
      renderCell: (item: any) => {
        return (
          <TableCellLayout style={{ wordBreak: "break-all" }}>
            {item.projectName}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: "User Name",
      renderHeaderCell: () => {
        return "User Name";
      },
      renderCell: (item: any) => {
        return (
          <TableCellLayout style={{ wordBreak: "break-all" }}>
            {item.localADUserName}
          </TableCellLayout>
        );
      },
    }),

    createTableColumn<Item>({
      columnId: "Modified By",
      renderHeaderCell: () => {
        return "Modified By";
      },
      renderCell: (item: any) => {
        return (
          <TableCellLayout style={{ wordBreak: "break-all" }}>
            {item.modifiedBy}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: "Modified Date",
      renderHeaderCell: () => {
        return "Modified Date";
      },
      renderCell: (item: any) => {
        const formattedDate = item.modifiedDatetime
          ? formatCustomStartDate(item.modifiedDatetime)
          : null;
        const date = formattedDate ? formattedDate.split("T")[0] : "-";
        return (
          <TableCellLayout style={{ wordBreak: "break-all" }}>
            {date}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: "",
      renderHeaderCell: () => {
        return "";
      },
      renderCell: (holiday: any) => {
        return (
          <TableCellLayout>
            <button
              onClick={() => openEditModal(holiday)}
              className="text-indigo-600 hover:text-indigo-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </button>
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: "",
      renderHeaderCell: () => "",
      renderCell: (item: Item) => (
        <TableCellLayout>
          <button onClick={() => openModal(item.id)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </TableCellLayout>
      ),
    }),
  ];
  const editApplicationSearch = user.filter((item: Item) =>
    Object.values(item).some(
      (value: any) =>
        value &&
        typeof value === "string" &&
        value.toLowerCase().includes(searchQuery)
    )
  );
  const handleClear = () => {
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSearchBoxChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => {
    const newValue = data?.value || "";
    setSearchQuery(newValue.toLowerCase());
  };

  const formatDateToTimeString = (date: Date) => {
    const localeTimeString = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hourCycle: "h24",
    });
    if (date.getHours() < 12) {
      return `${localeTimeString} AM`;
    }
    return `${localeTimeString} PM`;
  };
  return (
    <div className="flex flex-wrap space-x-0 space-y-2 md:space-y-0">
      <div className="flex-1 rounded-lg w-full max-h-80  overflow-y-auto">
        <div className="flex items-center justify-between my-2">
          <div className="text-violet-900">
            <button
              className="px-2 py-1 border border-violet-200 rounded-sm"
              onClick={handleOpenPopup} // Attach onClick event to open the popup
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
          </div>
          <div className={styles.root}>
            <div ref={inputRef}>
              <Input
                onChange={handleSearchBoxChange}
                size="large"
                value={searchQuery}
                contentBefore={<Search16Regular />}
                contentAfter={
                  searchQuery ? (
                    <div onClick={handleClear} style={{ cursor: "pointer" }}>
                      <CancelIcon />
                    </div>
                  ) : null
                }
                id="searchInput"
              />
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
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
                  <div className="">
                    <h2 className="text-xl font-semibold mb-4">
                      Are you sure you want to delete this user?
                    </h2>
                    <div className="flex justify-between">
                      <button
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-[#26C0BB] text-white font-semibold rounded"
                        onClick={handleConfirmDelete}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <DataGrid items={editApplicationSearch} columns={columns}>
          <DataGridHeader>
            <DataGridRow style={{ backgroundColor: "#26C0BB" }}>
              {({ renderHeaderCell }: any) => (
                <DataGridHeaderCell
                  style={{ backgroundColor: "#26C0BB", color: "white" }}
                >
                  {renderHeaderCell()}
                </DataGridHeaderCell>
              )}
            </DataGridRow>
          </DataGridHeader>
          <div className="table-container">
            {loading ? (
              <Spinner style={{ margin: 50 }} label="fetching data..." />
            ) : (
              <DataGridBody<Item>>
                {({ item, rowId }) => (
                  <DataGridRow<Item> key={rowId}>
                    {({ renderCell }) => (
                      <DataGridCell>{renderCell(item)}</DataGridCell>
                    )}
                  </DataGridRow>
                )}
              </DataGridBody>
            )}
          </div>
        </DataGrid>

        {editModalOpen && selecteduser && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
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
                    <div className="mt-3 text-center w-full  sm:mt-0 sm:ml-2 sm:text-left">
                      <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-2">
                        Edit EmployeeData
                      </h3>
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="mb-4 flex flex-col ">
                          <label
                            htmlFor="holiday"
                            className="block text-sm font-semibold text-gray-700"
                          >
                            Name<span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="displayName"
                            id="displayName"
                            value={selecteduser.displayName}
                            onChange={handleInputChange}
                            className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                          />
                        </div>
                        <div className="mb-4">
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
                            value={selecteduser.email}
                            onChange={handleInputChange}
                            className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                          />
                        </div>
                        <div className="mb-4">
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
                            value={selecteduser.jobTitle}
                            onChange={handleInputChange}
                            className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                          />
                        </div>
                        <div className="mb-4">
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
                            value={selecteduser.location}
                            onChange={handleInputChange}
                            className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                          />
                        </div>
                        <div className="mb-4">
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
                            value={selecteduser.division}
                            onChange={handleInputChange}
                            className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                          />
                        </div>
                        <div className="mb-4">
                          <label
                            htmlFor="date"
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
                              value={selectedProjectName} // Use selectedProjectName instead of selecteduser.project
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
                                        handleProjectClick(
                                          project.projectName,
                                          project.id
                                        )
                                      } // Pass both projectName and projectId
                                      className="p-2 cursor-pointer hover:bg-gray-100"
                                    >
                                      {project.projectName}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                          {/* <ProjectComboBox/> */}
                        </div>
                        <div className="mb-4">
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
                            value={selecteduser.branch}
                            onChange={handleInputChange}
                            className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                          />
                        </div>
                        <div className="mb-4">
                          <label
                            htmlFor="date"
                            className="block text-sm font-semibold text-gray-700"
                          >
                            Reporting Into
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="reportingInto"
                            id="reportingIno"
                            value={selecteduser.reportingInto}
                            onChange={handleInputChange}
                            className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                          />
                        </div>
                        <div className="mb-4">
                          <label
                            htmlFor="date"
                            className="block text-sm font-semibold text-gray-700"
                          >
                            ReportingIntoMail
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="reportingIntoMail"
                            id="reportingIntoMail"
                            value={selecteduser.reportingIntoMail}
                            onChange={handleInputChange}
                            className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                          />
                        </div>
                        <div className="mb-4">
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
                            value={selecteduser.localADUserName}
                            onChange={handleInputChange}
                            className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                          />
                        </div>

                        <div className="mb-4">
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
                            value={selecteduser.localADDomain}
                            onChange={handleInputChange}
                            className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                          />
                        </div>

                        <div className="mb-4">
                          <label
                            htmlFor="date"
                            className="block text-sm font-semibold text-gray-700"
                          >
                            ShiftStartTime
                            <span className="text-red-500">*</span>
                          </label>
                          <TimePicker
                            style={{
                              padding: "3px",
                              height: "43px",
                              minWidth: "220px",
                              marginTop: "5px",
                            }}
                            formatDateToTimeString={formatDateToTimeString}
                            onTimeChange={(_ev, data) => {
                              setSelectedUser((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      shiftStartTime:
                                        data.selectedTimeText ?? "",
                                    }
                                  : prev
                              );
                            }}
                            value={selecteduser.shiftStartTime}
                            //onInput={onTimePickerInput}

                            placeholder="Select cut-off time"
                          />
                        </div>

                        <div className="mb-4">
                          <label
                            htmlFor="date"
                            className="block text-sm font-semibold text-gray-700"
                          >
                            ShiftEndTime<span className="text-red-500">*</span>
                          </label>
                          <TimePicker
                            style={{
                              padding: "3px",
                              height: "43px",
                              minWidth: "220px",
                              marginTop: "5px",
                            }}
                            formatDateToTimeString={formatDateToTimeString}
                            onTimeChange={(_ev, data) => {
                              setSelectedUser((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      shiftEndTime: data.selectedTimeText ?? "",
                                    }
                                  : prev
                              );
                            }}
                            value={selecteduser.shiftEndTime}
                            //onInput={onTimePickerInput}

                            placeholder="Select cut-off time"
                          />
                        </div>

                        <div className="mb-4">
                          <label
                            htmlFor="screenshot"
                            className="block text-sm font-semibold text-gray-700"
                          >
                            Screenshot
                          </label>

                          <div className="text-170 mt-3 ml-2">
                            <Toggle
                              className="screenshot hover:bg-muted"
                              checked={selecteduser.isScreenshot}
                              onChange={(_, checked) =>
                                handleToggleChange(checked)
                              }
                              onText="Turn On"
                              offText="Turn Off"
                              styles={togglestyles}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleSave}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={closeEditModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(EditUserDatas);
