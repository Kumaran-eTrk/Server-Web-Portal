/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import {
  Combobox,
  ComboboxProps,
  Option,
  Persona,
  Spinner,
} from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import React, { useState } from "react";
import api from "../../../interceptors";
import {
  formatCustomEndDate,
  formatCustomStartDate,
  onFormatDate,
} from "../../../lib/Date-Utils";

import { HelpIcon } from "../../../shared/icons";
import ToolTip from "../../../shared/tooltip";
import useFetchUsers from "../../../shared/dropdown/EmployeePicker";

const AverageWorkHours = () => {
  const { users } = useFetchUsers();

  const [averageData, setAverageData] = useState<any[]>([]);
  const [selectEmployee, setSelectEmployee] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const today = new Date();
  const maxDate = today;

  const [value1, setValue1] = useState<Date | undefined>(today);
  const [value2, setValue2] = useState<Date | undefined>(today);

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

  const fetchAverageData = async () => {
    try {
      setLoading(true);

      const dataToPost = {
        email: employee.length > 0 ? employee : [],
        fromDate: startDate,
        toDate: endDate,
      };

      const response = await api.post(`/adminscreen/averagehours`, dataToPost);
      const data = response.data;

      setAverageData(data);
    } catch (error) {
      console.error("Error fetching Average data:", error);
      setAverageData([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (startDate && endDate && employee.length > 0) fetchAverageData();
  }, [startDate, endDate, employee]);

  const ExportApprovedCSV = () => {
    const header = "UserName,JobTitle,Project,AverageHours";
    let content = "";

    averageData?.map((element: any) => {
      content += `"${element?.user}","${element?.jobTitle}","${element?.team}","${element?.averageHours}",\n`;
    });

    const finaldata = header + "\n" + content;
    const blob = new Blob([finaldata], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const filename = `${"averageHours"}`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename.replace(/ /g, "_");
    link.click();
  };

  return (
    <div className="mt-8 flex flex-wrap space-x-0 space-y-2 md:space-x-4 md:space-y-0 ">
      <div className="flex-1 bg-white p-5 shadow rounded-lg  mb-10 w-full h-full md:w-1/2 ">
        <div className="flex flex-row items-center sm:justify-between">
          <div className="flex flex-col items-start justify-between ">
            <h2 className="flex gap-2 relative items-center text-gray-500 text-lg font-semibold pb-1 whitespace-nowrap">
              Average Working Hours
              <ToolTip
                text={
                  <React.Fragment>
                    <b>Average Hours</b>
                    <br />
                    <ul className="list-disc pl-5 mt-2">
                      <li className="mt-2">
                        The average hours calculation feature provides valuable
                        insights into
                        <br /> the average working hours of users over a
                        specified date range
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
          <div>
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
        <div className="flex items-center justify-start mt-2">
          <Combobox
            placeholder="Select an employee"
            selectedOptions={selectEmployee}
            onOptionSelect={onSelect}
            multiselect={true}
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
        <div className="my-3"></div>
        <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div>
        <br></br>
        <div className="flex flex-wrap justify-between  max-h-48  overflow-y-scroll overscroll-x-none ">
          <table className="w-full table-auto ml-2 text-sm text-center">
            <thead className="sticky top-0 z-2 bg-[#26C0BB] text-white ">
              <tr className="bg-[#26C0BB] w-full ">
                <th className="text-white text-sm px-6 py-2">Employee Name</th>
                <th className="text-white text-sm px-6 py-2">Role</th>
                <th className="text-white text-sm px-6 py-2">Project</th>
                <th className="text-white text-sm px-6 py-2 ">Working Hours</th>
              </tr>
            </thead>
            <tbody>
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
                averageData.map((item: any, index): any => (
                  <tr key={index}>
                    <td className="border-b-2 py-2">{item.user}</td>
                    <td className="border-b-2 py-2">{item.jobTitle}</td>
                    <td className="border-b-2 py-2">{item.team}</td>
                    <td className="border-b-2 py-2 text-green-600">
                      {item.averageHours}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-end justify-between data-bg">
          <button
            className="mt-5 px-3 py-1 rounded-sm border ml-auto bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] text-white border-gray-300"
            onClick={ExportApprovedCSV}
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default AverageWorkHours;
