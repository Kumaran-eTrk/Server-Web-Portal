
import { Button, Field, Input, InputOnChangeData, makeStyles, Spinner, Tooltip } from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { Search16Regular, Search20Regular } from "@fluentui/react-icons";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../contexts/authguard-context/Index";
import { useRangeContext } from "../../../contexts/range-context";
import api from "../../../interceptors";
import {
  formatCustomEndDate,
  formatCustomStartDate,
  onFormatDate,
} from "../../../lib/Date-Utils";
import { CancelIcon, HelpIcon } from "../../../shared/icons";
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

const IpAddress = () => {
  const [ipAddressData, setIpAddressData] = useState([""]);
  const { project, division }: any = useRangeContext();
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
  const styles = useStyles()
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const authContext = useContext(AuthContext);

  // Ensure authContext is defined
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { email } = authContext;
  
 

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

 

  const AddressSearch = ipAddressData
    ? ipAddressData.filter((item: any) =>
        Object.values(item).some(
          (value: any) =>
            value &&
            typeof value === "string" &&
            value.toLowerCase().includes(searchQuery)
        )
      )
    : [];

  const {
    selectedLocation,
    selectedDivision,
    selectedProject,
    selectedEmployee,
  }: any = useRangeContext();

  const fetchIPAddressData = async () => {
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
          `/divisions/${selectedDivision[0]}/projects/${selectedProject[0]}/user/ipdetails`,
          dataToPost
        );
        const data = response.data;
        setIpAddressData(Array.isArray(data) ? data : []);
      } else {
        const dataToPost = {
          fromDate: formattedStartDate,
          toDate: formattedEndDate,
          location: "",
          email: [email],
        };
        const response = await api.post(
          `/divisions/${division}/projects/${project}/user/ipdetails`,
          dataToPost
        );
        const data = response.data;
        setIpAddressData(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching IP address data:", error);
    } finally {
      setLoading(false); // Reset loading to false after API call (whether success or failure)
    }
  };
  useEffect(() => {
    if (
      selectedLocation.length > 0 &&
      selectedDivision.length > 0 &&
      selectedEmployee.length > 0 &&
      selectedProject.length > 0
    ) {
      fetchIPAddressData();
    }
  }, [formattedStartDate, formattedEndDate, selectedEmployee]);
  useEffect(() => {
    if (selectedEmployee.length === 0) {
      fetchIPAddressData();
    }
  }, [formattedStartDate, formattedEndDate, selectedEmployee, email]);

  return (
    <>
      <div className="mt-8 flex flex-wrap space-x-0 space-y-2 md:space-x-4 md:space-y-0 ">
        <div className="flex-1 bg-white p-5 shadow rounded-lg w-full ">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col items-start justify-between ">
              <div className="flex relative items-center gap-2 pb-1">
                <h2 className="flex  text-gray-500 text-lg font-semibold">
                  Devices
                </h2>
                <ToolTip
                  text={
                    <React.Fragment>
                      This section displays important details about the device,
                      such as the <b>IP address</b>,<br />
                      <br /> the username of the logged-in user, and the current
                      date and time.
                    </React.Fragment>
                  }
                >
                  <HelpIcon />
                </ToolTip>
              </div>
              <div className="flex text-sm">
                {formattedStartDate.split("T")[0]}
                <span className="px-1">to</span>
                {formattedEndDate.split("T")[0]}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">

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
          </div>

          <div className="my-4"></div>
          <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px  "></div>
          <div className="flex flex-wrap justify-between mt-2 h-28 overflow-y-scroll overscroll-x-none " id="ip">
            <table className="w-full table-auto ml-2 text-sm text-center ">
              <thead className="sticky top-0 z-0">
                <tr className="bg-[#26C0BB] w-full">
                  <th className="text-white text-sm px-4 py-2">
                    Employee Name
                  </th>
                  <th className="text-white text-sm px-4 py-2">User Name</th>
                  <th className="text-white text-sm px-4 py-2">IP Address</th>
                  <th className="text-white text-sm px-4 py-2">Date</th>
                </tr>
              </thead>

              <tbody>
                { loading ? (
                  <div
                    className="text-center py-4 px-56"
                    style={{ width: "100%" }}
                  >
                    <div style={{ display: "inline-block" }}>
                      <Spinner label="fetching data..." />
                    </div>
                  </div>
                ) : (
                  AddressSearch.map((item: any, index): any => (
                    <tr key={index}>
                      <td className="border-b-2 py-2">{item.displayName}</td>
                      <td className="border-b-2 py-2">{item.username}</td>
                      <td className="border-b-2 py-2">{item.ipAddress}</td>
                      <td className="border-b-2 py-2 w-28">
                        {new Date(item.recordDateTime).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default IpAddress;
