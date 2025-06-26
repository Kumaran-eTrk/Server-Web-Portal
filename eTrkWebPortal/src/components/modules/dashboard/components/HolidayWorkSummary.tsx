import { useContext, useEffect, useRef, useState } from "react";
import { useRangeContext } from "../../../contexts/range-context";

import {
  Button,
  Field,
  makeStyles,
  Spinner,
  Tooltip,
} from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { Search20Regular } from "@fluentui/react-icons";
import React from "react";
import { AuthContext } from "../../../contexts/authguard-context/Index";
import api from "../../../interceptors";
import {
  onFormatDate
} from "../../../lib/Date-Utils";
import useDateRange from "../../../shared/dropdown/DateRange";
import { HelpIcon } from "../../../shared/icons";
import ToolTip from "../../../shared/tooltip";

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
const HolidayWorkSummary = () => {
  const [workSummaryData, setWorkSummaryData] = useState<any[]>([]);
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
  const [holidayWorkData, setHolidayWorkData] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

 

  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { email } = authContext;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    selectedLocation,
    selectedDivision,
    selectedProject,
    selectedEmployee,
    project,
    division,
  }: any = useRangeContext();

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
          `/adminscreen/divisions/${selectedDivision[0]}/projects/${selectedProject[0]}/user/holidayworksummary`,
          dataToPost
        );

        const { totalHours, dateWiseMetrics } = response.data;

        setWorkSummaryData(dateWiseMetrics);

        if (Array.isArray(totalHours)) {
          setHolidayWorkData(
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
          `/adminscreen/divisions/${division}/projects/${project}/user/holidayworksummary`,
          dataToPost
        );

        const { totalHours, dateWiseMetrics } = response.data;

        setWorkSummaryData(dateWiseMetrics);
        if (Array.isArray(totalHours)) {
          setHolidayWorkData(
            totalHours.map((option, index) => ({
              id: index.toString(),
              value: option,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error in fetching holiday data");
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
  return (
    <div className="mt-8 flex flex-wrap  w-full space-x-0 space-y-2 md:space-x-4 md:space-y-0 ">
      <div className="flex- bg-white p-5 shadow rounded-lg w-full h-full xl:w-1/2">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start justify-between ">
            <h2 className="relative flex items-center gap-2 text-gray-500 text-lg font-semibold pb-1">
              Holiday Working Summary
              <ToolTip
                text={
                  <React.Fragment>
                    This section provides an overview of the selected users'
                    working hours on holidays and weekends
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
          {/* <DateRange selectedRange={selectedRange4} /> */}
        </div>
        <div className="my-2"></div>
        <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div>

        {loading ? (
          <div className="flex items-center justify-center w-full mt-7">
            <div>
              <Spinner label="fetching data..." />
            </div>
          </div>
        ) : (
          <>
            {holidayWorkData
              .filter((option: { value: any }) => option.value)
              .map((option: any, index: any): any => (
                <div className="flex flex-wrap justify-end mt-5" key={index}>
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
                </div>
              ))}
          </>
        )}

        <div className="flex items-end justify-between mt-12 data-bg">
          <button
            className="px-4 py-1 bg-gradient-to-r rounded-sm from-[#26C0BB] to-[#26C0BB] text-white font-normal border border-gray-300 ml-auto"
            onClick={handleDetailsClick}
          >
            Holiday Details
          </button>
        </div>
      </div>
      {showDetails && (
        <>
          <div className="fixed inset-0 bg-black opacity-50 z-10"></div>

          <div className="absolute z-10 p-5 w-7/12 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-md left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col items-start justify-between">
                <h2 className="flex text-gray-500 text-lg font-semibold pb-1">
                  Holiday Working summary
                </h2>
                <div className="flex text-sm">
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

            <div className="flex flex-wrap justify-between mt-2 max-h-80 overflow-y-scroll overscroll-x-none">
              <table className="w-full table-auto ml-2 text-sm text-center">
                <thead className="sticky top-0 z-0">
                  <tr className="bg-[#26C0BB] w-full">
                    <th className="text-white text-sm  py-2">User</th>
                    <th className="text-white text-sm  py-2">Date</th>
                    <th className="text-white text-sm  py-2">Day</th>
                    <th className="text-white text-sm  py-2">Logged Hours</th>
                    <th className="text-white text-sm  py-2">Working Hours</th>
                    <th className="text-white text-sm  py-2 w-28">
                      Idle Hours
                    </th>
                    <th className="text-white text-sm  py-2 w-28">
                      Productive Hours
                    </th>
                    <th className="text-white text-sm  py-2 w-28">
                      UnProductive Hours
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workSummaryData.length === 0 ? (
                    <div className="flex items-center justify-center py-3">
                      <p className="text-base text-center text-gray-400 py-5">
                        Select Employee & Date Range
                      </p>
                    </div>
                  ) : (
                    workSummaryData.map(
                      (
                        item: {
                          name: any;
                          day: any;
                          date: any;
                          loggedHours: any;
                          workingHours: any;
                          idleHours: any;
                          productiveHours: any;
                          nonProductiveHours: any;
                        },
                        index: any
                      ) => (
                        <tr key={index}>
                          <td className="border-b-2 py-2">{item.name}</td>
                          <td className="border-b-2 py-2">{item.date}</td>
                          <td className="border-b-2 py-2">{item.day}</td>
                          <td className="border-b-2 py-2">
                            {item.loggedHours}
                          </td>
                          <td className="border-b-2 py-2">
                            {item.workingHours}
                          </td>
                          <td className="border-b-2 py-2">{item.idleHours}</td>
                          <td className="border-b-2 py-2">
                            {item.productiveHours}
                          </td>
                          <td className="border-b-2 py-2 w-28">
                            {item.nonProductiveHours}
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default HolidayWorkSummary;
