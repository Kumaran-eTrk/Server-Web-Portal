import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatCustomEndDate,
  formatCustomStartDate,
  onFormatDate,
} from "../../../lib/Date-Utils";

import {
  Combobox,
  ComboboxProps,
  Option,
  Persona,
  Spinner,
} from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import React from "react";
import api from "../../../interceptors";
import useFetchUsers from "../../../shared/dropdown/EmployeePicker";
import { HelpIcon } from "../../../shared/icons";
import ToolTip from "../../../shared/tooltip";
const WorkingPattern = () => {
  const [chartWidth, setChartWidth] = useState(
    window.innerWidth < 600 ? window.innerWidth - 150 : 520
  );
  const [patternGraphData, setpatternGrapData] = useState<any[]>([]);
  const today = new Date();
  const maxDate = today;
  const [value1, setValue1] = useState<Date | undefined>(today);
  const [value2, setValue2] = useState<Date | undefined>(today);
  const { users } = useFetchUsers();
  const [selectEmployee, setSelectEmployee] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const onSelectStartDate = (
    date: Date | any,
    setValueFn: React.Dispatch<React.SetStateAction<Date | any>>
  ) => {
    setValueFn(date);
  };
  const onSelectEndDate = (
    date: Date | any,
    setValueFn: React.Dispatch<React.SetStateAction<Date | any>>
  ) => {
    setValueFn(date);
  };

  const startDate = formatCustomStartDate(value1);
  const endDate = formatCustomEndDate(value2);
  const editEmployee =
    employee && employee.length > 0 ? employee[0].replace(" ", "%20") : "";

  const [loading, setLoading] = useState(false);

  const fetchPatternData = async () => {
    try {
      setLoading(true);
      if (startDate) {
        const response = await api.post(
          `adminscreen/workingpattern?email=${editEmployee}`,
          {
            fromDate: startDate,
            toDate: endDate,
          }
        );

        const data = response.data;

        setpatternGrapData(data);
      }
    } catch (error) {
      console.error("Error fetching work summary graph data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSelect: ComboboxProps["onOptionSelect"] = (_event, data) => {
    if (data.selectedOptions) {
      setSelectEmployee(data.selectedOptions);

      const selectedIds = users
        .filter((user) => data.selectedOptions.includes(user.email))
        .map((user) => user.email);
      setEmployee(selectedIds);
    } else {
      setEmployee([]);
    }
  };

  useEffect(() => {
    if (startDate && endDate && editEmployee.length > 0) fetchPatternData();
  }, [startDate, endDate, editEmployee]);

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

  return (
    <div className="mt-8 flex flex-wrap space-x-0 space-y-2   md:space-x-4 md:space-y-0 ">
      <div className="flex-1 bg-white p-4 shadow rounded-lg w-full h-full ">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start justify-between ">
            <h2 className="relative flex items-center gap-2 text-gray-500 text-lg font-semibold pb-1">
              Working Pattern Graph
              <ToolTip
                text={
                  <React.Fragment>
                    <b>User Login and Logout Times</b>
                    <br />

                    <ul className="list-disc pl-5 mt-2">
                      <li className="mt-2">Select the users in dropdown</li>
                      <li className="mt-2">
                        To view a graphical representation of their login and
                        logout times.
                      </li>
                    </ul>
                  </React.Fragment>
                }
              >
                <HelpIcon />
              </ToolTip>
            </h2>
            <div className="flex text-sm">
              {startDate.split("T")[0]}

              <span className="px-1">to</span>
              {endDate.split("T")[0]}
            </div>
          </div>
          <div className="mt-6">
            <DatePicker
              value={value1 || today} // Use the state value here
              onSelectDate={(date) => onSelectStartDate(date, setValue1)} // Store selected date in useState
              placeholder="Start date"
              formatDate={onFormatDate}
              today={today}
              maxDate={maxDate}
              className="styles.control"
              id="End Date"
            />

            <DatePicker
              value={value2 || today} // Use the state value here
              onSelectDate={(date) => onSelectEndDate(date, setValue2)} // Store selected date in useState
              placeholder="End date"
              formatDate={onFormatDate}
              today={today}
              maxDate={maxDate}
              className="styles.control"
              id="End Date"
            />
          </div>
          <div className="flex items-end justify-between data-bg mt-2 ml-2">
            <button
              className="px-4 py-2 rounded-sm bg-gradient-to-r  text-gray-500 font-normal border border-gray-300 ml-auto"
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
        </div>
        {showDetails && (
          <>
            <div className="fixed inset-0 bg-black opacity-50 z-10"></div>

            <div className="absolute z-20 p-3 w-6/12 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-md top-1/4 left-1/4 ">
              <div className="flex-1  p-3  w-auto">
                <div className="flex flex-row items-center justify-between">
                  <div className="flex flex-col items-start justify-between ">
                    <h2 className="flex text-gray-500 text-lg font-semibold pb-1">
                      Working Pattern Graph
                    </h2>
                    <div className="flex text-sm">
                      {startDate.split("T")[0]}

                      <span className="px-1">to</span>
                      {endDate.split("T")[0]}
                    </div>
                  </div>
                  <div className="flex items-end justify-between data-bg mt-2">
                    <button
                      className="px-4 py-1 rounded-sm bg-gradient-to-r  text-gray-500 font-normal  ml-auto"
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
                </div>
                <div className="my-1"></div>
                <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div>
                <div className="mt-2 gap-3 inline-flex"></div>
                <div className="flex flex-col  mt-4 ">
                  <div className="Graph">
                    <LineChart
                      width={chartWidth + 100}
                      height={320}
                      data={patternGraphData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />

                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="loggedInTime"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="loggedOutTime"
                        stroke="#82ca9d"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <div className="my-1"></div>
        <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div>
        <div className="mt-4  inline-flex">
          <Combobox
            placeholder="Select an employee"
            selectedOptions={selectEmployee}
            onOptionSelect={onSelect}
          >
            {users.map((user, index) => (
              <Option key={index.toString()} text={user.email}>
                <Persona
                  avatar={{ color: "colorful", "aria-hidden": true }}
                  name={user.displayName}
                  secondaryText={user.jobTitle}
                />
              </Option>
            ))}
          </Combobox>
        </div>
        <div className="flex flex-col  mt-10">
          <div className="Graph mt-2 ">
            {loading ? (
              <tr>
                <td
                  className="text-center py-10 px-60 "
                  colSpan={3}
                  style={{ width: "100%" }}
                >
                  <div style={{ display: "inline-block" }}>
                    <Spinner label="fetching data..." />
                  </div>
                </td>
              </tr>
            ) : (
              <LineChart
                width={chartWidth}
                height={220}
                data={patternGraphData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="loggedInTime"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="loggedOutTime"
                  stroke="#82ca9d"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            )}
            <div className="flex flex-row justify-center gap-4 flex-wrap text-xs py-3 font-light">
              <div className="flex items-center gap-2">
                <span className="bg-[#8884d8] w-4 h-4"></span>
                <p>LoggedInTime</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-[#82ca9d] w-4 h-4"></span>
                <p>loggedOutTime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WorkingPattern;
