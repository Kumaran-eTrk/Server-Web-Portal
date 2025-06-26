import { useEffect, useState } from "react";

import {
  Combobox,
  ComboboxProps,
  Option,
  Persona,
  Spinner,
} from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import React from "react";
import { toast } from "react-toastify";

import {
  formatCustomEndDate,
  formatCustomStartDate,
  onFormatDate,
} from "../../../lib/Date-Utils";
import useFetchUsers from "../../../shared/dropdown/EmployeePicker";
import { HelpIcon } from "../../../shared/icons";
import ToolTip from "../../../shared/tooltip";
import api from "../../../interceptors";

const UserRecording = () => {
  const { users } = useFetchUsers();
  const [videourl, setVideoUrl] = useState<any[]>([]);
  const [selectEmployee, setSelectEmployee] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const today = new Date();
  const start = formatCustomStartDate(today);
  const end = formatCustomEndDate(today);
  const [dateRange, setDateRange] = useState({
    startDate: start,
    endDate: end,
  });
  const [startdate, setStartDate] = useState<Date | null | undefined>(today);

  const UserRecording = async () => {
    try {
      setLoading(true);
      if (employee) {
        const apiUrl = "/adminscreen/userrecordings";
        const response = await api.get(
          `${apiUrl}?email=${employee}&fromDate=${dateRange.startDate}&toDate=${dateRange.endDate}`
        );

        const data = response.data;

        setVideoUrl(data);
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(`Failed : ${error.response.data.error}`, {
          autoClose: 2000,
        });
      }
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
    if (employee.length > 0) {
      UserRecording();
    }
  }, [employee, dateRange]);

  const handleClose = () => {
    setShowDetails(false);
  };

  const onSelectDate = (date: Date | null | undefined) => {
    if (!date) return;

    const startOfDay: any = formatCustomStartDate(new Date(date));

    const endOfDay: any = formatCustomEndDate(new Date(date));

    setDateRange({
      startDate: startOfDay,
      endDate: endOfDay,
    });
  };

  const playVideo = (videoBase64: string) => {
    const binaryData = atob(videoBase64);
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binaryData.length; i++) {
      view[i] = binaryData.charCodeAt(i);
    }

    const blob = new Blob([arrayBuffer], { type: "video/mp4" });

    const videoUrl = URL.createObjectURL(blob);

    setSelectedVideoUrl(videoUrl);
    setShowDetails(true);
  };

  return (
    <div className="mt-8   flex flex-wrap space-x-0 space-y-2 md:space-x-4 md:space-y-0 ">
      <div className="flex-1 bg-white p-5 shadow rounded-lg w-full md:w-1/2 ">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start justify-between ">
            <h2 className="flex relative gap-2 items-center text-gray-500 text-lg font-semibold pb-1">
              Employee Activity Recording
              <ToolTip
                text={
                  <React.Fragment>
                    <b>Employee Recording</b>
                    <br />
                    <ul className="list-disc pl-5 mt-2">
                      <li className="mt-2">
                        Select the user form the dropdown
                      </li>
                      <li className="mt-2">
                        Watch a video recording of the user's activities on
                        their machine.
                      </li>
                    </ul>
                  </React.Fragment>
                }
              >
                <HelpIcon />
              </ToolTip>
            </h2>
            <div className="flex text-sm"></div>
          </div>
          <DatePicker
            value={startdate || today}
            onSelectDate={(date) => onSelectDate(date)}
            placeholder="Start date"
            formatDate={onFormatDate}
            today={today}
            maxDate={today}
            id="Start Date"
          />
        </div>
        <div className="my-1"></div>
        <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div>
        <div className="mt-2 gap-12 inline-flex">
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
        <div
          className="flex flex-wrap justify-between mt-2 h-44 overscroll-x-none "
          id="video"
        >
          <table className="w-full table-auto ml-2 text-sm text-center">
            <thead className="sticky top-0 z-0">
              <tr className="bg-[#26C0BB] w-full h-10">
                <th className="text-white text-sm px-6 py-2">Employee Name</th>
                <th className="text-white text-sm px-6 py-2">Date</th>
                <th className="text-white text-sm px-6 py-2 w-28 mr-3 text-left">
                  Recordings
                </th>
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
                videourl.map((item: any, index): any => (
                  <tr key={index}>
                    <td className="border-b-2 py-2">{item.displayName}</td>
                    <td className="border-b-2 py-2">{item.date}</td>
                    <td className="border-b-2 py-2 text-green-600">
                      {showDetails && (
                        <>
                          <div className="fixed inset-0 bg-black opacity-50 z-10"></div>
                          <div className="absolute z-10 p-5 w-6/12 h-3/5 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-md left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="flex flex-row items-center justify-between">
                              <div className="flex flex-col items-start justify-between">
                                <h2 className="flex text-gray-500 text-lg font-semibold pb-1">
                                  Screen Recording
                                </h2>
                                <div className="flex text-sm text-black"></div>
                              </div>
                              <button
                                className="text-gray-500 font-medium px-5 py-1 rounded-sm border"
                                onClick={handleClose}
                              >
                                Close
                              </button>
                            </div>
                            <div className="my-2.5"></div>
                            <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div>
                            {selectedVideoUrl && (
                              <video
                                controls={true}
                                autoPlay
                                className="w-full h-5/6 mt-1"
                              >
                                <source
                                  src={selectedVideoUrl}
                                  type="video/mp4"
                                />
                                Your browser does not support the video tag.
                              </video>
                            )}
                          </div>
                        </>
                      )}
                      {item.videoFile ? (
                        <button
                          className="mr-2 ml-6 flex  items-center border-2 border-solid border-gray-200 rounded-sm px-2 py-1"
                          onClick={() => playVideo(item.videoFile)}
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
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
                            />
                          </svg>
                          Play
                        </button>
                      ) : (
                        <span>No video available</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default UserRecording;
