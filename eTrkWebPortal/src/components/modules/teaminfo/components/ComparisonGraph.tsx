import { IChartProps, MultiStackedBarChart } from "@fluentui/react-charting";
import * as React from "react";
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
import { useState } from "react";
import api from "../../../interceptors";
import useFetchUsers from "../../../shared/dropdown/EmployeePicker";
import { HelpIcon } from "../../../shared/icons";
import ToolTip from "../../../shared/tooltip";

export const UserComparisonChart: React.FC = () => {
  const { users } = useFetchUsers();
  const [selectEmployee, setSelectEmployee] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const today = new Date();
  const maxDate = today;
  const [value1, setValue1] = useState<Date | undefined>(today);
  const [value2, setValue2] = useState<Date | undefined>(today);
  const [userComparisonData, setSelecteduserComparisonData] = React.useState<
    any[]
  >([]);
  const [loading, setLoading] = useState(false);

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

  const fetchUserComparisonData = async () => {
    try {
      setLoading(true);
      const dataToPost = {
        fromDate: startDate,
        toDate: endDate,
        email: employee.length > 0 ? employee : [],
      };
      const response = await api.post(
        `/adminscreen/usercomparision`,
        dataToPost
      );
      const data = response.data;
      if (data.userComparison.length > 0) {
        setSelecteduserComparisonData(data.userComparison);
      } else {
        setSelecteduserComparisonData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    if (startDate && endDate && employee.length > 0) fetchUserComparisonData();
  }, [startDate, endDate, employee]);

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

  const chartDataPoints = userComparisonData.map((user) => [
    {
      legend: "Logged hours",
      data: parseFloat(user.loggedHours),
      color: "#444791",
    },
    {
      legend: "Working hours",
      data: parseFloat(user.workingHours),
      color: "#16a34a",
    },
    {
      legend: "Idle hours",
      data: parseFloat(user.idleHours),
      color: "#facc15",
    },
    {
      legend: "Productive hours",
      data: parseFloat(user.productiveMinutes),
      color: "#67e8f9",
    },
    {
      legend: "UnProductive hours",
      data: parseFloat(user.nonProductiveMinutes),
      color: "#ef4444",
    },
  ]);

  const data: IChartProps[] = userComparisonData.map((user, index) => ({
    chartTitle: user.user,
    chartData: chartDataPoints[index],
  }));
  const hideRatio: boolean[] = [true, true];

  const handleDetailsClick = () => {
    setShowDetails(!showDetails);
  };
  const handleClose = () => {
    setShowDetails(false);
  };

  return (
    <div className="mt-8 flex flex-wrap space-x-0 space-y-2 md:space-x-4 md:space-y-0 ">
      <div className="flex-1 bg-white p-5 shadow rounded-lg w-full h-80 md:w-1/2">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start justify-between ">
            <h2 className=" relative flex items-center gap-2 text-gray-500 text-lg font-semibold pb-1">
              Employee Comparison Chart
              <ToolTip
                text={
                  <React.Fragment>
                    <b>Compare Working Times</b>
                    <br />
                    <ul className="list-disc pl-5 mt-2">
                      <li className="mt-2 text-justify">
                        Select multiple users from the dropdown menu to compare
                        <br />
                        their working times using bar graphs
                      </li>

                      <li className="mt-2">
                        This will exlude holidays and weekends
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
          <div className="mt-2 ">
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
        </div>
        <div className="my-1"></div>
        <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div>

        <div className="mt-2 gap-12 inline-flex">
        <Combobox
            placeholder="Select an employee"
            selectedOptions={selectEmployee}
            onOptionSelect={onSelect}
            multiselect={true}
          >
            {users.map((user,index) => (
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
        {showDetails && (
          <>
            <div className="fixed inset-0 bg-black opacity-50 z-10"></div>

            <div className="absolute z-20 p-3 w-6/12 h-96 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-md top-1/4 left-1/4 ">
              <div className="flex-1  p-3  w-auto">
                <div className="flex flex-row items-center justify-between">
                  <div className="flex flex-col items-start justify-between ">
                    <h2 className=" relative flex items-center gap-2 text-gray-500 text-lg font-semibold pb-1">
                      Employee Comparison Chart
                      <ToolTip
                        text={
                          <React.Fragment>
                            <b>Compare Working Times</b>
                            <br />
                            <li className="mt-2">
                              Select multiple users from the dropdown menu to
                              compare their working times using bar graphs
                            </li>

                            <li className="mt-2">
                              This will exlude holidays and weekends
                            </li>
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
                <div className="flex flex-col mb-20 ">
                  <div className="Graph h-28">
                    {loading ? (
                      <tr>
                        <td
                          className="text-center py-9 px-60 "
                          colSpan={3}
                          style={{ width: "100%" }}
                        >
                          <div style={{ display: "inline-block" }}>
                            <Spinner label="fetching data..." />
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: "4px",
                          }}
                        ></div>
                        <div
                          style={{ width: "720px",maxHeight:'140px' }}
                          className="line-chart  "
                        >
                          <MultiStackedBarChart
                            data={data}
                            hideRatio={hideRatio}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="widget-body">
          <>
            <div className="">
              <div className="divider"></div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "15px",
                }}
              >
                <div></div>
                <div style={{ marginLeft: "4px" }}></div>
              </div>
              {loading ? (
                <Spinner style={{ margin: 100 }} label="fetching data..." />
              ) : (
                <div>
                 
                    <div>
                      <div style={{ maxHeight: "130px", overflowY: "auto" }}>
                        <MultiStackedBarChart
                          data={data}
                          hideRatio={hideRatio}
                        />
                      </div>
                    </div>
                 
                </div>
              )}
            </div>
          </>
        </div>
      </div>
    </div>
  );
};
