import React, { useState, useEffect } from "react";

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
import { formatCustomStartDate } from "../../../../../lib/Date-Utils";

import api from "../../../../../interceptors";
import { CancelIcon } from "../../../../../shared/icons";
import { Search16Regular } from "@fluentui/react-icons";

import { toast } from "react-toastify";


import "../../../../../../index.css";

import { useRangeContext } from "../../../../../contexts/range-context";

interface Item {
  id: number;
  projectName: string;
}

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
    maxWidth: "340px",
    height: "20px",
    marginTop: "5px",
  },
});
const EditProject = () => {
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = React.useState([]);
  const { setProjectPopup }: any = useRangeContext();
  const handleOpenPopup = () => {
    setProjectPopup(true); // Function to set showPopup state to true
  };

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        const response = await api.get("/adminscreen/getprojects");
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  const openEditModal = (holiday: Item) => {
    setSelectedProject(holiday);
    setEditModalOpen(true);
   
  };

  const closeEditModal = () => {
    setSelectedProject(null);
    setEditModalOpen(false);
  };

  const styles = useStyles();

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const editApplicationSearch = projects.filter((item: Item) =>
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

  const updateHoliday = async (updatedHoliday: Item) => {
    try {
      setLoading(true);
      await api.put(
        `/adminscreen/updateproject/${updatedHoliday.id}`,
        updatedHoliday
      );
      const response = await api.get("/adminscreen/getprojects");
      if (response.status === 200) {
        setProjects(response.data);
        toast.success("Project Updated successfully ", { autoClose: 2000 });
      }
    } catch (error: any) {
      console.error("Error updating holiday:", error);
      if (error.response.status === 409) {
        toast.error("User role already exists!");
      }
      if (error.response.status === 400) {
        toast.error("field is required");
      }
      toast.error("Failed to update project ", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (selectedProject) {
      updateHoliday(selectedProject);
      closeEditModal();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedProject) {
      setSelectedProject({
        ...selectedProject,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSearchBoxChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => {
    const newValue = data?.value || "";
    setSearchQuery(newValue.toLowerCase());
  };

  const columns: TableColumnDefinition<Item>[] = [
    createTableColumn<Item>({
      columnId: "Project",
      renderHeaderCell: () => {
        return "Project";
      },
      renderCell: (item: any) => {
        return <TableCellLayout>{item.projectName}</TableCellLayout>;
      },
    }),
    createTableColumn<Item>({
      columnId: "Modified By",
      renderHeaderCell: () => {
        return "Modified By";
      },
      renderCell: (item: any) => {
        if (item.modifiedBy === null) {
          return (
            <TableCellLayout className="text-center pl-10">-</TableCellLayout>
          ); // Render a placeholder or empty cell
        }
        return <TableCellLayout>{item.modifiedBy}</TableCellLayout>;
      },
    }),
    createTableColumn<Item>({
      columnId: "Modified Date",
      renderHeaderCell: () => {
        return "Modified Date";
      },
      renderCell: (item: any) => {
        // Check if ModifiedDatetime is null
        if (item.modifiedDatetime === null) {
          return (
            <TableCellLayout className="text-center pl-10">-</TableCellLayout>
          ); // Render a placeholder or empty cell
        }

        // Assuming item.date is a Date object
        const formattedDate = formatCustomStartDate(item.modifiedDatetime);
        const date = formattedDate.split("T")[0];
        return <TableCellLayout>{date}</TableCellLayout>;
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
  ];

  return (
    <div className="flex flex-wrap space-x-0 space-y-2 md:space-y-0">
      <div className="flex-1 rounded-lg w-full max-h-80  overflow-y-auto">
      
        <div className="flex items-center justify-between my-2">
          <div className="text-violet-900">
            <button
              className="px-2 py-1 border border-violet-200 rounded-sm"
              onClick={handleOpenPopup} 
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
        {editModalOpen && selectedProject && (
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
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                        Edit Project
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
                            name="projectName"
                            id="projectName"
                            required
                            value={selectedProject.projectName}
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

export default EditProject;
