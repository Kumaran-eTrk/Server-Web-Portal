/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */

import {
  Button,
  Field,
  makeStyles,
  Spinner,
  Tooltip,
} from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { Search20Regular } from "@fluentui/react-icons";
import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../../contexts/authguard-context/Index";
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

const WorkSummary = React.memo(() => {
  const [workSummaryData, setWorkSummaryData] = useState<any[]>([]);
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

  const [loading, setLoading] = useState(false);
  const [totaldata, setTotalData] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const {
    selectedLocation,
    selectedDivision,
    selectedProject,
    selectedEmployee,
    project,
    division,
  }: any = useRangeContext();

  const styles = useStyles();

  const authContext = useContext(AuthContext);

  // Ensure authContext is defined
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { email, admin, manager } = authContext;

  const dropdownRef = useRef<HTMLDivElement>(null);

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
          `/divisions/${selectedDivision[0]}/projects/${selectedProject[0]}/user/worksummary`,
          dataToPost
        );

        const { totalHours, dateWiseMetrics } = response.data;

        const sortedData = dateWiseMetrics.sort((a: any, b: any) => {
          const userNameA = a.user.toLowerCase();
          const userNameB = b.user.toLowerCase();
          return userNameA.localeCompare(userNameB);
        });

        setWorkSummaryData(sortedData);

        if (Array.isArray(totalHours)) {
          setTotalData(
            totalHours.map((option, index) => ({
              id: index.toString(),
              value: option,
            }))
          );
        }
      } else {
        const dataToPost = {
          fromDate: formattedStartDate,
          toDate: formattedEndDate,
          location: "",
          email: [email],
        };
        const response = await api.post(
          `/divisions/${division}/projects/${project}/user/worksummary`,
          dataToPost
        );

        const { totalHours, dateWiseMetrics } = response.data;

        const sortedData = dateWiseMetrics.sort((a: any, b: any) => {
          const userNameA = a.user.toLowerCase();
          const userNameB = b.user.toLowerCase();
          return userNameA.localeCompare(userNameB);
        });

        setWorkSummaryData(sortedData);
        if (Array.isArray(totalHours)) {
          setTotalData(
            totalHours.map((option, index) => ({
              id: index.toString(),
              value: option,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error fetching IP address data:", error);
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

  const handleDetailsClick = () => {
    setShowDetails(!showDetails);
  };
  const handleClose = () => {
    setShowDetails(false);
  };
  useEffect(() => {
    const handleOutsideClick = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDetails(false);
      }
    };
    if (showDetails) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [showDetails]);
  const ExportApprovedCSV = () => {
    const header =
      "User,Job Title,Date,LoggedHours,WorkingHours,IdleHours,ProductiveHours,UnProductiveHours";
    let content = "";

    workSummaryData?.map((element: any) => {
      content += `"${element?.user}","${element.jobtitle}","${element?.date}","${element?.loggedHours}","${element?.workingHours}","${element?.idleHours}","${element?.productiveMinutes}","${element?.nonProductiveMinutes}",\n`;
    });

    const finaldata = header + "\n" + content;
    const blob = new Blob([finaldata], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const filename = `${"WorkSummaryData"}`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename.replace(/ /g, "_");
    link.click();
  };
  return (
    <>
      <div className="mt-8 flex flex-wrap space-x-0 space-y-2 md:space-x-4 md:space-y-0">
        <div className="flex-1 bg-white p-4 shadow rounded-lg w-full md:w-auto">
          {" "}
          {/* Responsive width */}
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col items-start justify-between ">
              <h2 className=" relative flex items-center gap-2 text-gray-500 text-lg font-semibold pb-1">
                Working Summary
                <ToolTip
                  text={
                    <React.Fragment>
                      <b> Work Summary : </b>
                      <br />
                      <ul className="list-disc pl-5 mt-2">
                        <li className="mt-2">
                          <b>Logged Hours:</b> Total hours logged by the user.
                        </li>
                        <li className="mt-2">
                          <b>Working Hours:</b> Hours actively spent working.
                        </li>
                        <li className="mt-2">
                          <b>Idle Hours:</b> Periods of machine inactivity.
                        </li>
                        <li className="mt-2">
                          <b>Productive Hours:</b> Time spent on productive
                          tasks.
                        </li>
                        <li className="mt-2">
                          <b>Unproductive Hours:</b> Time spent on
                          non-productive
                        </li>
                        tasks.
                        <li className="mt-2">
                          <b>Idle hours</b> are specifically used to monitor
                          periods
                        </li>
                        when the machine is inactive.
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
                    maxDate={maxDate}
                    className={styles.control}
                    id="End Date"
                  />
                </Field>
                <Tooltip content="Search date" relationship="label">
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
                </Tooltip>
              </div>
            </div>
          </div>
          <hr className="my-3 bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-[1.5px] " />
          {loading ? (
            <tr>
              <td
                className="text-center py-4 px-60"
                colSpan={3}
                style={{ width: "100%" }}
              >
                <div style={{ display: "inline-block" }}>
                  <Spinner label="fetching data..." />
                </div>
              </td>
            </tr>
          ) : (
            totaldata
              .filter((option) => option.value)
              .map((option: any, index: any): any => (
                <div className="flex flex-wrap mt-4 justify-end" key={index}>
                  <div className="flex-1 bg-gradient-to-r rounded-lg flex flex-col items-center justify-center space-y-2 m-2">
                    <p className="text-cyan-500 text-center text-lg font-semibold">
                      {option.value.loggedHours}
                    </p>
                    <p className="text-gray-700 text-center text-sm whitespace-nowrap max-w-[18ch] overflow-hidden text-ellipsis">
                      Logged Hours
                    </p>
                  </div>
                  <div className="flex-1 bg-gradient-to-r rounded-lg flex flex-col items-center justify-center space-y-2 m-2">
                    <p className="text-cyan-500 text-center text-lg font-semibold">
                      {option.value.workingHours}
                    </p>
                    <p className=" text-gray-700 text-center text-sm whitespace-nowrap max-w-[18ch] overflow-hidden text-ellipsis">
                      Working Hours
                    </p>
                  </div>
                  <div className="flex-1 bg-gradient-to-r rounded-lg flex flex-col items-center justify-center space-y-2 m-2">
                    <p className="text-yellow-500 text-center text-lg font-semibold">
                      {option.value.idleHours}
                    </p>
                    <p className=" text-gray-700 text-center text-sm whitespace-nowrap max-w-[18ch] overflow-hidden text-ellipsis">
                      Idle Hours
                    </p>
                  </div>
                  {admin == "true" || manager == "true" ? (
                    <>
                      <div className="flex-1 bg-gradient-to-r rounded-lg flex flex-col items-center justify-center space-y-2 m-2">
                        <p className="text-cyan-500 text-center text-lg font-semibold">
                          {option.value.productiveHours}
                        </p>
                        <p className=" text-gray-700 text-center text-sm whitespace-nowrap max-w-[18ch] overflow-hidden text-ellipsis">
                          Productive Hours
                        </p>
                      </div>
                      <div className="flex-1 bg-gradient-to-r rounded-lg flex flex-col items-center justify-center space-y-2 m-2">
                        <p className="text-red-500 text-center text-lg font-semibold">
                          {option.value.nonProductiveHours}
                        </p>
                        <p className=" text-gray-700 text-center text-sm whitespace-nowrap max-w-[18ch] overflow-hidden text-ellipsis">
                          Unproductive hours
                        </p>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              ))
          )}
          <div className="flex items-end justify-between mt-5 data-bg">
            <button
              className="px-4 py-1 text-black font-normal border border-gray-300 rounded-sm"
              onClick={handleDetailsClick}
            >
              Work Summary Details
            </button>

            {admin == "true" || manager == "true" ? (
              <button
                className="mt-3 px-3 py-1 border ml-auto bg-gradient-to-r rounded-sm from-[#26C0BB] to-[#26C0BB] text-white border-gray-300"
                onClick={ExportApprovedCSV}
              >
                Export CSV
              </button>
            ) : (
              <></>
            )}
          </div>
          {showDetails && (
            <>
              <div className="fixed inset-0 bg-black opacity-50 z-10"></div>

              <div className="absolute z-10 p-5 w-7/12 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-md left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="flex flex-row items-center justify-between">
                  <div className="flex flex-col items-start justify-between">
                    <h2 className="flex text-gray-500 text-lg  font-semibold ">
                      Working summary
                    </h2>
                    <div className="flex text-sm pb-2">
                      {formattedStartDate.split("T")[0]}
                      <span className="px-1">to</span>
                      {formattedEndDate.split("T")[0]}
                    </div>
                  </div>
                  <button
                    className="text-gray-500 font-medium px-5 py-1 rounded-sm border"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                </div>

                <div className="flex flex-wrap justify-between   max-h-96 overflow-y-scroll overscroll-x-none">
                  <table className="w-full table-auto text-sm text-center">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-[#26C0BB] w-full">
                        <th className="text-white text-sm  py-2">User</th>
                        <th className="text-white text-sm  py-2">Date</th>
                        <th className="text-white text-sm  py-2">
                          Logged Hours
                        </th>
                        <th className="text-white text-sm  py-2">
                          Working Hours
                        </th>
                        <th className="text-white text-sm  py-2 w-28">
                          Idle Hours
                        </th>
                        {admin == "true" || manager == "true" ? (
                          <>
                            <th className="text-white text-sm  py-2 w-28">
                              Productive Hours
                            </th>
                            <th className="text-white text-sm  py-2 w-28">
                              UnProductive Hours
                            </th>
                          </>
                        ) : (
                          <></>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {workSummaryData.length == 0 ? (
                        <tr>
                          <td
                            className="text-center text-gray-500 py-3 text-base"
                            colSpan={3}
                          >
                            No records found
                          </td>
                        </tr>
                      ) : loading ? (
                        <tr>
                          <td
                            className="text-center py-4 px-72"
                            colSpan={3}
                            style={{ width: "100%" }}
                          >
                            <div style={{ display: "inline-block" }}>
                              <Spinner label="fetching data..." />
                            </div>
                          </td>
                        </tr>
                      ) : (
                        workSummaryData.map((item, index) => (
                          <tr key={index}>
                            <td className="border-b-2 py-2">{item.user}</td>
                            <td className="border-b-2 py-2">
                              {item.date.split(" ")[0]}
                            </td>

                            <td className="border-b-2 py-2">
                              {item.loggedHours}
                            </td>
                            <td className="border-b-2 py-2">
                              {item.workingHours}
                            </td>
                            <td className="border-b-2 py-2">
                              {item.idleHours}
                            </td>
                            {admin == "true" || manager == "true" ? (
                              <>
                                <td className="border-b-2 py-2">
                                  {item.productiveMinutes}
                                </td>
                                <td className="border-b-2 py-2 w-28">
                                  {item.nonProductiveMinutes}
                                </td>
                              </>
                            ) : (
                              <></>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
});
export default WorkSummary;
