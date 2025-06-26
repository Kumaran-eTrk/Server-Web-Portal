/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import api from "../../../interceptors";
import React from "react";
import { useRangeContext } from "../../../contexts/range-context";
import {
  formatCustomEndDate,
  formatCustomStartDate,
  onFormatDate,
} from "../../../lib/Date-Utils";

import { Input, InputOnChangeData, Spinner } from "@fluentui/react-components";
import { TimeRange } from "../../../shared/dropdown/Timedropdown";
import { CancelIcon, HelpIcon } from "../../../shared/icons";
import { Search16Regular } from "@fluentui/react-icons";
import ToolTip from "../../../shared/tooltip";
import { DatePicker } from "@fluentui/react-datepicker-compat";

const NonLoggedUsers = React.memo(() => {
  const [nonLoggedUsers, setNonLoggedUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { timePickerValue }: any = useRangeContext();
  const [loading, setLoading] = useState(false);
  const today = new Date();
  const maxDate = today;
  const [value1, setValue1] = useState<Date | undefined>(today);
  const [value2, setValue2] = useState<Date | undefined>(today);

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSearchBoxChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => {
    const newValue = data?.value || "";
    setSearchQuery(newValue.toLowerCase());
  };

  const handleClear = () => {
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const LoggedUsers: any = nonLoggedUsers
    ? nonLoggedUsers.filter((item: any) =>
        Object.values(item).some(
          (value: any) =>
            value &&
            typeof value === "string" &&
            value.toLowerCase().includes(searchQuery)
        )
      )
    : [];

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
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const dataToPost = {
        fromDate: startDate,
        toDate: endDate,
        time: timePickerValue,
      };
      const response = await api.post(
        `adminscreen/userloginstatus`,
        dataToPost
      );
      const data = response.data;

      if (Array.isArray(data)) {
        setNonLoggedUsers(data);
      } else {
        console.error("API response is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching user login status data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate && timePickerValue.length > 0) fetchUserData();
  }, [startDate, endDate, timePickerValue]);

  const ExportApprovedCSV = () => {
    const header = "Date,UserName,JobTitle,ShiftTime,Status";
    let content = "";

    nonLoggedUsers?.map((element: any) => {
      content += `"${element?.date.substring(0, 10)}","${element?.userName}","${
        element?.jobTitle
      }","${element?.shiftTime}","${
        element?.Status ? "" : "Not Logged in"
      }",\n`;
    });

    const finaldata = header + "\n" + content;
    const blob = new Blob([finaldata], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const filename = `${"NonLoggedinUsers"}`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename.replace(/ /g, "_");
    link.click();
  };

  return (
    <div className="mt-8 flex flex-wrap space-x-0 space-y-2 md:space-x-4 md:space-y-0 ">
      <div className="flex-1 bg-white p-4 shadow rounded-lg w-full h-full md:w-1/2">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start justify-between ">
            <h2 className="flex gap-2 relative items-center text-gray-500 text-lg font-semibold pb-1">
              Non-Logged In Employee's
              <ToolTip
                text={
                  <React.Fragment>
                    <b>User Login Activity</b>
                    <br />
                    <ul className="list-disc pl-5 mt-2">
                      <li className="mt-2">
                        Use the dropdown menu to select a cutoff time
                      </li>
                      <li className="mt-2">
                        This will display a list of all users who have not
                        logged in after the specified time,
                      </li>
                      <li className="mt-2">
                        This will exclude the holidays and weekends
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
          <div className="mt-2 gap-3 inline-flex ">
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
        </div>

        <div className="my-1"></div>
        <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div>

        <div className="flex items-center justify-between">
          <TimeRange onTimePickerChange="timepicker1" />
          <div ref={inputRef}>
            <Input
              onChange={handleSearchBoxChange}
              size="medium"
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

        <div className="flex flex-wrap justify-between mt-2 bg-white h-52 overflow-y-scroll overscroll-x-none " id="unlogged">
          <table className="w-full table-auto ml-2 text-sm text-center">
            <thead className="sticky top-0 z-2 bg-[#26C0BB] text-white ">
              <tr className="bg-[#26C0BB] w-full">
                <th className="text-white text-sm px-6 py-2">Employee Name</th>
                <th className="text-white text-sm px-6 py-2">Shift Time</th>
                <th className="text-white text-sm px-6 py-2 inline-block">
                  Job Title
                </th>
                <th className="text-white text-sm px-6 py-2">Project</th>
                <th className="text-white text-sm px-6 py-2 w-28">Status</th>
                <th className="text-white text-sm px-6 py-2 w-28">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    className="text-center py-9 px-56 "
                    colSpan={3}
                    style={{ width: "100%" }}
                  >
                    <div style={{ display: "inline-block" }}>
                      <Spinner label="fetching data..." />
                    </div>
                  </td>
                </tr>
              ) : (
                LoggedUsers.map((item: any, index: any): any => (
                  <tr key={index}>
                    <td className="border-b-2 py-2">{item.userName}</td>
                    <td className="border-b-2 py-2">{item.shiftTime}</td>
                    <td className="border-b-2 py-2">{item.jobTitle}</td>
                    <td className="border-b-2 py-2">{item.team}</td>
                    <td
                      className={`border-b-2 py-2 ${
                        item.status ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {item.status ? "IN" : "Not Logged In"}
                    </td>
                    <td className="border-b-2 py-2">
                      {item.date.substring(0, 10)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-end justify-between data-bg">
          <button
            className=" px-3 py-1  mt-4 rounded-sm border ml-auto bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] text-white border-gray-300"
            onClick={ExportApprovedCSV}
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
});

export default NonLoggedUsers;
