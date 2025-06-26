/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { useContext, useEffect, useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useRangeContext } from "../../../contexts/range-context";
import api from "../../../interceptors";
import {
  formatCustomEndDate,
  formatCustomStartDate,
  onFormatDate,
} from "../../../lib/Date-Utils";
import { Search20Regular } from "@fluentui/react-icons";

// import { GetApplication } from "../../popover/ShowApplication";
import { Button, Field, makeStyles, Spinner } from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import React from "react";
import { AuthContext } from "../../../contexts/authguard-context/Index";
import { HelpIcon } from "../../../shared/icons";
import ToolTip from "../../../shared/tooltip";
import useDateRange from "../../../shared/dropdown/DateRange";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "row",
    columnGap: "5px",
  },
  control: {
    maxWidth: "150px",
  },
});

export default function ProductiveApp() {
  const styles = useStyles();
  const today = new Date();
  const {
    startdate,
    enddate,
    maxDate,
    onSelectDate,
    onSelectDate1,
    handleSearchClick,
    formattedStartDate,
    formattedEndDate,
    setStartDate,
    setEndDate,
  } = useDateRange(today);
  const [chartWidth, setChartWidth] = useState(
    window.innerWidth < 600 ? window.innerWidth - 150 : 520
  );
  // const { admin }: any = useRangeContext();
  const [productiveData, setProductiveData] = useState<any[]>([]);
  const [types, setTypes] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const selectedRange2 = "selectedRange2";
  const { dateRange2, project, division }: any = useRangeContext();

  const [showAddApplicationModal, setShowAddApplicationModal] = useState(false);

  const [exportdata, setExportData] = useState([]);
  // Function to close the modal
  const closeAddApplicationModal = () => {
    setShowAddApplicationModal(false);
  };

  const [loading, setLoading] = useState(false);

  const generateRandomColors = (numColors: number) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      colors.push(color);
    }
    return colors;
  };

  // Retrieve variables from local storage
  // Use AuthContext to get email
  const authContext = useContext(AuthContext);

  // Ensure authContext is defined
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { email, admin, manager } = authContext;
  const {
    selectedLocation,
    selectedDivision,
    selectedProject,
    selectedEmployee,
  }: any = useRangeContext();
  const fetchData = async (type: string) => {
    try {
      setLoading(true);
      try {
        if (
          selectedLocation.length > 0 &&
          selectedDivision.length > 0 &&
          selectedEmployee.length > 0 &&
          selectedProject.length > 0
        ) {
          let apiUrl = `/divisions/${selectedDivision[0]}/projects/${selectedProject[0]}/user/applicationusage`;
          const dataToPost = {
            fromDate: formattedStartDate,
            toDate: formattedEndDate,
            type: type,
            location: selectedLocation.length > 0 ? selectedLocation[0] : "",
            email: selectedEmployee.length > 0 ? selectedEmployee : "",
          };

          const response = await api.post(apiUrl, dataToPost);
          const data = response.data;
          setProductiveData(
            data
              .filter((item: any) => item.activeMinutes > 0)
              .map((item: any) => ({
                activeMinutes: item.activeMinutes, // Assuming 'activeMinutes' is the property for X-axis
                application: item.application,
              }))
          );
        } else {
          let apiUrl = "";
          if (type === "productive") {
            apiUrl = `/divisions/${division}/projects/${project}/user/applicationusage`; // Replace with the actual endpoint for productive data
          } else if (type === "unproductive") {
            apiUrl = `/divisions/${division}/projects/${project}/user/applicationusage`; // Replace with the actual endpoint for unproductive data
          }

          const response = await api.post(apiUrl, {
            fromDate: formattedStartDate,
            toDate: formattedEndDate,
            type: type,
            location: "",
            email: [email],
          });

          const data = response.data;

          setProductiveData(
            data
              .filter((item: any) => item.activeMinutes > 0)
              .map((item: any) => ({
                activeMinutes: item.activeMinutes,
                application: item.application,
              }))
          );
        }
      } catch (error) {
        console.error("Error fetching IP address data:", error);
      }
    } catch (error) {
      console.error("Error fetching productive app data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      selectedLocation.length > 0 &&
      selectedDivision.length > 0 &&
      selectedEmployee.length > 0 &&
      selectedProject.length > 0
    ) {
      fetchData(types ? "productive" : "unproductive");

      const handleResize = () => {
        setChartWidth(window.innerWidth < 600 ? window.innerWidth - 150 : 550);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [formattedStartDate, formattedEndDate, selectedEmployee, email]);
  useEffect(() => {
    if (selectedEmployee.length === 0) {
      fetchData(types ? "productive" : "unproductive");
      const handleResize = () => {
        setChartWidth(window.innerWidth < 600 ? window.innerWidth - 150 : 520);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [formattedStartDate, formattedEndDate, selectedEmployee, email]);
  const handleDetailsClick = () => {
    setShowDetails(!showDetails);
  };
  const handleClose = () => {
    setShowDetails(false);
  };

  // CSV Data fetch
  const fetchCSVData = async (type: string) => {
    try {
      setLoading(true);
      try {
        if (
          selectedLocation.length > 0 &&
          selectedDivision.length > 0 &&
          selectedEmployee.length > 0 &&
          selectedProject.length > 0
        ) {
          let apiUrl = `/divisions/${selectedDivision[0]}/projects/${selectedProject[0]}/user/userapplicationusage`;
          const dataToPost = {
            fromDate: formattedStartDate,
            toDate: formattedEndDate,
            type: type,
            location: selectedLocation.length > 0 ? selectedLocation[0] : "",
            email: selectedEmployee.length > 0 ? selectedEmployee : "",
          };

          const response = await api.post(apiUrl, dataToPost);
          const data = response.data;
          setExportData(data);
        } else {
          let apiUrl = "";
          if (type === "productive") {
            apiUrl = `/divisions/${division}/projects/${project}/user/userapplicationusage`;
          } else if (type === "unproductive") {
            apiUrl = `/divisions/${division}/projects/${project}/user/userapplicationusage`;
          }

          const response = await api.post(apiUrl, {
            fromDate: formattedStartDate,
            toDate: formattedEndDate,
            type: type,
            location: "",
            email: [email],
          });

          const data = response.data;

          setExportData(data);
        }
      } catch (error) {
        console.error("Error fetching IP address data:", error);
      }
    } catch (error) {
      // Handle any errors that occur during the API request
      console.error("Error fetching productive app data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      selectedLocation.length > 0 &&
      selectedDivision.length > 0 &&
      selectedEmployee.length > 0 &&
      selectedProject.length > 0 &&
      email
    ) {
      fetchCSVData(types ? "productive" : "unproductive");

      const handleResize = () => {
        setChartWidth(window.innerWidth < 600 ? window.innerWidth - 150 : 550);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [formattedStartDate, formattedEndDate, selectedEmployee, email]);

  useEffect(() => {
    if (selectedEmployee.length === 0) {
      fetchCSVData(types ? "productive" : "unproductive");
      const handleResize = () => {
        setChartWidth(window.innerWidth < 600 ? window.innerWidth - 150 : 520);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [formattedStartDate, formattedEndDate, selectedEmployee, email]);

  const ExportApprovedCSV = () => {
    const header = "User,Application,ActiveMinutes,Productive";
    let content = "";

    exportdata?.map((userData: any) => {
      userData.applications.forEach((app: any) => {
        content += `"${userData.displayName}","${app.application}","${app.activeMinutes}","${app.productive}",\n`;
      });
    });

    const formatDate = (dateString: string) => {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, options);
    };

    const finaldata = header + "\n" + content;
    const blob = new Blob([finaldata], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const filename = `${"ApplicationUsage"} - ${formattedStartDate} to ${formattedEndDate}`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename.replace(/ /g, " ");
    link.click();
  };
  const colors = useMemo(
    () => generateRandomColors(productiveData.length),
    [productiveData.length]
  );
  return (
    <>
      <div className="mt-4 flex flex-wrap space-x-0 space-y-2 md:space-x-4 md:space-y-0 ">
        <div className="flex-1 bg-white p-4   shadow rounded-lg w-full md:w-1/2">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col items-start justify-between ">
              {types ? (
                <h2 className=" relative flex gap-2 items-center text-gray-500 text-lg font-semibold pb-1">
                  Productive App
                  <ToolTip
                    text={
                      <React.Fragment>
                        <b>Application Usage</b>
                        <br />
                        <ul className="list-disc pl-2 mt-2">
                          <li className="mt-2">
                            <b>Productive Applications : </b> Applications
                            considered beneficial for your current project.
                          </li>

                          <li className="mt-2">
                            <b>Unproductive Applications : </b> Applications
                            that are not relevant to your current project.
                          </li>

                          <li className="mt-2">
                            The classification of each application depends on
                            the
                            <b> specific project </b> you are working on.
                          </li>

                          <li className="mt-2">
                            This will exclude the weekends and holidays data.{" "}
                          </li>
                        </ul>
                      </React.Fragment>
                    }
                  >
                    <HelpIcon />
                  </ToolTip>
                </h2>
              ) : (
                <h2 className=" relative flex gap-2 items-center text-gray-500 text-lg font-semibold pb-1">
                  UnProductive App
                  <ToolTip
                    text={
                      <React.Fragment>
                        <b>Application Usage</b>
                        <br />
                        <ul className="list-disc pl-5 mt-2">
                          <li className="mt-2">
                            <b>Productive Applications : </b> Applications
                            considered beneficial for your current project.
                          </li>

                          <li className="mt-2">
                            <b>Unproductive Applications : </b> Applications
                            that are not relevant to your current project.
                          </li>

                          <li className="mt-2">
                            The classification of each application depends on
                            the
                            <b> specific project </b> you are working on.
                          </li>

                          <li className="mt-2">
                            This will exclude the weekends and holidays data.{" "}
                          </li>
                        </ul>
                      </React.Fragment>
                    }
                  >
                    <HelpIcon />
                  </ToolTip>
                </h2>
              )}
              <div className="flex text-sm">
                {formattedStartDate.split("T")[0]}
                <span className="px-1">to</span>
                {formattedEndDate.split("T")[0]}
              </div>
            </div>
            <div>
              <div className={styles.container}>
                <Field required>
                  <DatePicker
                    value={startdate || today}
                    onSelectDate={(date) => onSelectDate(date, setStartDate)}
                    placeholder="Start date"
                    formatDate={onFormatDate}
                    today={today}
                    maxDate={maxDate}
                    id="Start Date"
                    className={styles.control}
                  />
                </Field>
                <Field required>
                  <DatePicker
                    value={enddate || today}
                    onSelectDate={(date) => onSelectDate1(date, setEndDate)}
                    placeholder="End date"
                    formatDate={onFormatDate}
                    today={today}
                    maxDate={today}
                    className={styles.control}
                    id="End Date"
                  />
                </Field>

                <Button
                  appearance="primary"
                  style={{
                    backgroundColor: "#26C0BB",
                    height: "30px",
                    marginTop: "2px",
                  }}
                  icon={<Search20Regular />}
                  onClick={handleSearchClick}
                />
              </div>
              {/* <DateRange selectedRange={selectedRange2} /> */}
            </div>
          </div>
          <div className="my-1"></div>
          <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div>
          <div className="flex items-end justify-between data-bg mt-2">
            <button
              className="px-3 py-1 rounded-sm bg-gradient-to-r  text-gray-500 font-normal border border-gray-300 ml-auto"
              onClick={handleDetailsClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3 h-4 text-black"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                />
              </svg>
            </button>
          </div>
          <div className=" py-3.5 max-h-full ">
            {loading ? (
              <div
                className="flex items-center justify-center"
                style={{ width: "100%", height: "250px" }}
              >
                <div>
                  <Spinner label="fetching data..." />
                </div>
              </div>
            ) : (
              <div className=" flex  flex-col items-start justify-between flex-wrap LineGraph">
                {types ? (
                  <div className="text-center">
                    <h1 className="text-base text-gray-500"></h1>
                  </div>
                ) : (
                  <div className="text-center">
                    <h1 className="text-base text-gray-500"></h1>
                  </div>
                )}

                <div
                  className="overflow-x-scroll overflow-y-scroll"
                  id="names"
                  style={{ height: "250px", width: "100%" }}
                >
                  <ComposedChart
                    layout="vertical"
                    width={chartWidth}
                    height={Math.max(250, productiveData.length * 50)}
                    data={productiveData}
                    margin={{
                      top: 20,
                      right: 20,
                      bottom: 20,
                      left: 20,
                    }}
                  >
                    <CartesianGrid stroke="#f5f5f5" />
                    <XAxis type="number" />
                    <YAxis dataKey="application" type="category" scale="band" />
                    <Tooltip />
                    <Bar dataKey="activeMinutes" barSize={20} radius={5}>
                      {productiveData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index]}
                          style={{ opacity: "0.7" }}
                        />
                      ))}
                    </Bar>
                  </ComposedChart>
                </div>
              </div>
            )}
            {productiveData.length > 0 && (
              <div className="flex flex-row  2xl:flex-row   flex-wrap text-xs py-1 font-semibold max-h-[300px] mt-3 overflow-y-auto">
                {...productiveData.map((item: any, index: any): any => (
                  <div className="flex flex-row  flex-wrap items-center gap-1 ">
                    <span
                      className="p-2"
                      style={{ backgroundColor: colors[index], opacity: "1" }}
                    ></span>
                    <h3 className="p-1">{item.application}</h3>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showAddApplicationModal && (
            <div className="data-tables-modal">
              <div className="modal-content">
                <span className="close" onClick={closeAddApplicationModal}>
                  &times;
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between  data-bg">
            <div>
              <button
                className={`hover:bg-gray-400 border text-gray-800 font-bold py-2 px-4 rounded-l text-sm ${
                  types ? "bg-gray-400" : ""
                }`}
                onClick={() => {
                  fetchData("productive");
                  setTypes(true);
                }}
              >
                Productive
              </button>

              <button
                className={`bg-gray-200 border hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r text-sm ${
                  !types ? "bg-gray-400" : ""
                }`}
                onClick={() => {
                  fetchData("unproductive");
                  setTypes(false);
                }}
              >
                Unproductive
              </button>

              {showDetails && (
                <>
                  <div className="fixed inset-0 bg-black opacity-50 z-10"></div>

                  <div className="absolute z-20 p-3 w-6/12 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-md top-1/4 left-1/4 ">
                    <div className="flex-1 p-2 w-auto">
                      <div className="flex justify-end">
                        <button
                          className="rounded-sm bg-gradient-to-r text-gray-500 font-normal"
                          onClick={handleClose}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.3}
                            stroke="currentColor"
                            className="w-8 h-8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="flex flex-row items-center justify-between">
                        <div className="flex flex-col items-start justify-between ">
                          {types ? (
                            <h2 className="flex text-gray-500 text-lg font-semibold pb-1">
                              Productive-App
                            </h2>
                          ) : (
                            <h2 className="flex text-gray-500 text-lg font-semibold pb-1">
                              UnProductive-App
                            </h2>
                          )}

                          <div className="flex text-sm">
                            {formattedStartDate.split("T")[0]}
                            <span className="px-1">to</span>
                            {formattedEndDate.split("T")[0]}
                          </div>
                        </div>
                      </div>
                      <div className="my-1"></div>
                      <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div>
                      <div className="flex flex-col mt-1 ">
                        <div className="LineGraph">
                          {types ? (
                            <div className="text-center"></div>
                          ) : (
                            <div className="text-center"></div>
                          )}
                          {productiveData.length > 0 && (
                            <div
                              className="overflow-x-scroll overflow-y-scroll"
                              style={{ height: "300px", width: "100%" }}
                            >
                              <ComposedChart
                                layout="vertical"
                                width={chartWidth + 100}
                                height={Math.max(
                                  250,
                                  productiveData.length * 50
                                )}
                                data={productiveData}
                                margin={{
                                  top: 20,
                                  right: 20,
                                  bottom: 20,
                                  left: 20,
                                }}
                              >
                                <CartesianGrid stroke="#f5f5f5" />
                                <XAxis type="number" />
                                <YAxis
                                  dataKey="application"
                                  type="category"
                                  scale="band"
                                />
                                <Tooltip />
                                <Bar
                                  dataKey="activeMinutes"
                                  barSize={20}
                                  radius={5}
                                >
                                  {productiveData.map((_, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={colors[index]}
                                      style={{ opacity: "0.7" }}
                                    />
                                  ))}
                                </Bar>
                                {/* <Bar
                                  dataKey="activeMinutes"
                                  barSize={20}
                                  fill="#00D0C9"
                                  background={{ fill: "#eee" }}
                                  radius={5}
                                /> */}
                              </ComposedChart>
                            </div>
                          )}
                        </div>
                        {productiveData.length > 0 && (
                          <div className="flex flex-row items-start justify-center 2xl:flex-row items-center justify-center  flex-wrap text-xs py-1 font-semibold max-h-[300px] overflow-y-auto">
                            {...productiveData.map(
                              (item: any, index: any): any => (
                                <div className="flex flex-row  flex-wrap items-center gap-1 ">
                                  <span
                                    className="p-2"
                                    style={{ backgroundColor: colors[index] }}
                                  ></span>
                                  <h3 className="p-1">{item.application}</h3>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      {showAddApplicationModal && (
                        <div className="data-tables-modal">
                          <div className="modal-content">
                            <span
                              className="close"
                              onClick={closeAddApplicationModal}
                            >
                              &times;
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 data-bg">
                        <div>
                          <button
                            className={`hover:bg-gray-400 border text-gray-800 font-bold py-2 px-4 rounded-l text-sm ${
                              types ? "bg-gray-400" : ""
                            }`}
                            onClick={() => {
                              fetchData("productive");
                              setTypes(true);
                            }}
                          >
                            Productive
                          </button>

                          <button
                            className={`bg-gray-200 border hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r text-sm ${
                              !types ? "bg-gray-400" : ""
                            }`}
                            onClick={() => {
                              fetchData("unproductive");
                              setTypes(false);
                            }}
                          >
                            Unproductive
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div>
              {admin == "true" || manager == "true" ? (
                <button
                  className="px-3 py-1 border ml-auto bg-gradient-to-r rounded-sm from-[#26C0BB] to-[#26C0BB] text-white border-gray-300"
                  onClick={ExportApprovedCSV}
                >
                  Export CSV
                </button>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
