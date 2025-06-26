/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */

import { Button, Field, makeStyles, Spinner } from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { Search20Regular } from "@fluentui/react-icons";
import React, { useContext, useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
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
import { HelpIcon } from "../../../shared/icons";
import ToolTip from "../../../shared/tooltip";
import useDateRange from "../../../shared/dropdown/DateRange";
import { AuthContext } from "../../../contexts/authguard-context/Index";
import CustomTooltip from "../../../lib/custom-tooltip";

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

function ProductivityGraph() {
  const [productiveGraphData, setProductiveGrapData] = useState<any[]>([]);
  const [chartWidth, setChartWidth] = useState(
    window.innerWidth < 600 ? window.innerWidth - 150 : 550
  );
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
  const styles = useStyles();
  const [loading, setLoading] = useState(false);
  const [dataRange, setDataRange] = useState([0, 0]);

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
    project,
    division,
  }: any = useRangeContext();
  const [showDetails, setShowDetails] = useState(false);

  const fetchWorkSummaryData = async () => {
    try {
      setLoading(true);
      if (
        selectedLocation.length > 0 &&
        selectedDivision.length > 0 &&
        selectedEmployee.length > 0 &&
        selectedProject.length > 0
      ) {
        const dataToPost = {
          fromDate: formattedStartDate,
          toDate: formattedEndDate,
          location: selectedLocation.length > 0 ? selectedLocation[0] : "",
          email: selectedEmployee.length > 0 ? selectedEmployee : "",
        };

        const response = await api.post(
          `/divisions/${selectedDivision[0]}/projects/${selectedProject[0]}/user/worksummarygraph`,
          dataToPost
        );
        const data = response.data;
        const updatedData = data?.map((item: any) => {
          return {
            ...item,
            unproductiveHours: item.nonProductiveHours,
            loggedHours: item.loggedHours,
            workingHours: item.workingHours,
            productiveHours: item.productiveHours,
            idleHours: item.idleHours,
          };
        });
        setProductiveGrapData(updatedData);
      } else {
        const dataToPost = {
          fromDate: formattedStartDate,
          toDate: formattedEndDate,
          location: "",
          email: [email],
        };
        const response = await api.post(
          `/divisions/${division}/projects/${project}/user/worksummarygraph`,
          dataToPost
        );

        const data = response.data;

        const updatedData = data.map((item: any) => {
          return {
            ...item,
            unproductiveHours: item.nonProductiveHours,
            loggedHours: item.loggedHours,
            workingHours: item.workingHours,
            productiveHours: item.productiveHours,
            idleHours: item.idleHours,
          };
        });
        setProductiveGrapData(updatedData);
      }
    } catch (error) {
      // Handle any errors that occur during the API request
      console.error("Error fetching work summary graph data:", error);
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
      fetchWorkSummaryData();
    }
  }, [formattedStartDate, formattedEndDate, selectedEmployee, email]);

  useEffect(() => {
    if (selectedEmployee.length === 0) {
      fetchWorkSummaryData();
    }
  }, [formattedStartDate, formattedEndDate, selectedEmployee, email]);

  useEffect(() => {
    const handleResize = () => {
      setChartWidth(window.innerWidth < 600 ? window.innerWidth - 150 : 550);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleDetailsClick = () => {
    setShowDetails(!showDetails);
  };
  const handleClose = () => {
    setShowDetails(false);
  };

  useEffect(() => {
    if (productiveGraphData.length > 0) {
      const dataValues = productiveGraphData?.flatMap((data) => [
        data.loggedHours,
        data.workingHours,
        data.unproductiveHours,
        data.productiveHours,
        data.idleHours,
      ]);
      const minValue = Math.min(...dataValues);
      const maxValue = Math.max(...dataValues);
      setDataRange([minValue, maxValue]);
    }
  }, [productiveGraphData]);

  return (
    <>
      <div className="mt-4 flex flex-wrap space-x-0 space-y-2 md:space-x-4 md:space-y-0 ">
        <div className="flex-1 bg-white p-4 shadow rounded-lg w-full md:w/2">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col items-start justify-between ">
              <h2 className=" relative flex items-center gap-2 text-gray-500 text-lg font-semibold pb-1">
                Working Summary Graph
                <ToolTip
                  text={
                    <React.Fragment>
                      <b>Working Summary Graph</b>
                      <br />
                      <ul className="list-disc pl-5 mt-2">
                        <li className="mt-2">
                          You can view the graph on a weekly, monthly, or yearly
                          basis for the working patterns.
                        </li>

                        <li className="mt-2">
                          This will exclude the weekends and holidays data.
                        </li>
                      </ul>
                    </React.Fragment>
                  }
                >
                  <HelpIcon />
                </ToolTip>
              </h2>
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
          <div className="flex flex-col ">
            <div className="Graph">
              {loading ? (
                <div
                  className="flex items-center justify-center"
                  style={{ width: "100%", height: "340px" }}
                >
                  <div style={{ display: "inline-block" }}>
                    <Spinner label="fetching data..." />
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="90%" height={340}>
                  <LineChart
                    width={chartWidth}
                    height={340}
                    data={productiveGraphData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis type="number" domain={dataRange} />
                    <Tooltip content={<CustomTooltip />} />

                    <Line
                      type="monotone"
                      dataKey="idleHours"
                      strokeWidth={2}
                      stroke="#facc15"
                      fill="#facc15"
                    />
                    {admin == "true" || manager == "true" ? (
                      <>
                        {" "}
                        <Line
                          type="monotone"
                          dataKey="unproductiveHours"
                          strokeWidth={2}
                          stroke="#ef4444"
                          fill="#ef4444"
                        />
                        <Line
                          type="monotone"
                          dataKey="productiveHours"
                          strokeWidth={2}
                          stroke="#67e8f9"
                          fill="#67e8f9"
                        />
                      </>
                    ) : (
                      <></>
                    )}
                    <Line
                      type="monotone"
                      dataKey="workingHours"
                      stroke="#16a34a"
                      strokeWidth={2}
                      fill="#16a34a"
                    />
                    <Line
                      type="monotone"
                      dataKey="loggedHours"
                      stroke="#444791"
                      strokeWidth={2}
                      fill="#444791"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex flex-row gap-4 flex-wrap text-xs py-3 font-semibold">
              <div className="flex items-center gap-2">
                <span className="bg-[#444791] w-4 h-4"></span>
                <h3>Logged Hours</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-[#16a34a] w-4 h-4"></span>
                <h3>Working Hours</h3>
              </div>
              {admin == "true" || manager == "true" ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#67e8f9] w-4 h-4"></span>
                    <h3>Productive Hours</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#ef4444] w-4 h-4"></span>
                    <h3>Unproductive Hours</h3>
                  </div>
                </>
              ) : (
                <></>
              )}
              <div className="flex items-center gap-2">
                <span className="bg-[#facc15] w-4 h-4"></span>
                <h3>Idle Hours</h3>
              </div>
            </div>

            {showDetails && (
              <>
                <div className="fixed inset-0 bg-black opacity-50 z-10"></div>

                <div className="absolute z-20 p-5 w-6/12 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-md top-1/4 left-1/4 ">
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
                      <h2 className="flex text-gray-500 text-lg font-semibold pb-1">
                        Working Summary Graph
                      </h2>
                      <div className="flex text-sm">
                        {formattedStartDate.split("T")[0]}

                        <span className="px-1">to</span>
                        {formattedEndDate.split("T")[0]}
                      </div>
                    </div>
                  </div>
                  <div className="my-1"></div>
                  <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div>
                  <div className="flex flex-col  mt-2 ">
                    <div className="Graph">
                      {productiveGraphData.length === 0 ? (
                        <div className="text-center text-gray-500 py-3 text-base">
                          No records found
                        </div>
                      ) : loading ? (
                        <div
                          className="text-center py-4 px-72"
                          style={{ width: "100%" }}
                        >
                          <div style={{ display: "inline-block" }}>
                            <Spinner label="fetching data..." />
                          </div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="90%" height={340}>
                          <LineChart
                            width={chartWidth}
                            height={340}
                            data={productiveGraphData}
                            margin={{
                              top: 10,
                              right: 30,
                              left: 0,
                              bottom: 0,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis type="number" domain={dataRange} />
                            <Tooltip content={<CustomTooltip />} />

                            <Line
                              type="monotone"
                              dataKey="idleHours"
                              strokeWidth={2}
                              stroke="#facc15"
                              fill="#facc15"
                            />
                            {admin == "true" || manager == "true" ? (
                              <>
                                {" "}
                                <Line
                                  type="monotone"
                                  dataKey="unproductiveHours"
                                  strokeWidth={2}
                                  stroke="#ef4444"
                                  fill="#ef4444"
                                />
                                <Line
                                  type="monotone"
                                  dataKey="productiveHours"
                                  strokeWidth={2}
                                  stroke="#67e8f9"
                                  fill="#67e8f9"
                                />
                              </>
                            ) : (
                              <></>
                            )}
                            <Line
                              type="monotone"
                              dataKey="workingHours"
                              stroke="#16a34a"
                              strokeWidth={2}
                              fill="#16a34a"
                            />
                            <Line
                              type="monotone"
                              dataKey="loggedHours"
                              stroke="#444791"
                              strokeWidth={2}
                              fill="#444791"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    <div className="flex flex-row gap-2 flex-wrap text-xs py-2 font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#444791] w-4 h-4"></span>
                        <h3>Logged Hours</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#16a34a] w-4 h-4"></span>
                        <h3>Working Hours</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-[#67e8f9] w-4 h-4"></span>
                        <h3>Productive Hours</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#ef4444] w-4 h-4"></span>
                        <h3>Unproductive Hours</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#facc15] w-4 h-4"></span>
                        <h3>Idle Hours</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
export default ProductivityGraph;
