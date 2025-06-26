
import { useContext, useEffect, useState } from "react";
import api from "../../interceptors";
import { Input, InputOnChangeData, Spinner } from "@fluentui/react-components";
import React from "react";
import { CancelIcon, HelpIcon } from "../../shared/icons";
import { Search16Regular } from "@fluentui/react-icons";
import ToolTip from "../../shared/tooltip";
import { AuthContext } from "../../contexts/authguard-context/Index";

const AgentStatus = () => {
  const [agentStatus, setAgentStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/adminscreen/agentstatus`);
        const data = response.data;

        if (Array.isArray(data)) {
          
          data.sort((a, b) => {

            const statusA = a.domains[0]?.status || "";
            const statusB = b.domains[0]?.status || "";

            if (statusA === "Not Running" && statusB !== "Not Running") {
              return -1;
            } else if (statusA !== "Not Running" && statusB === "Not Running") {
              return 1;
            } else {
              return 0;
            }
          });

          setAgentStatus(data);
        } else {
          console.error("API response is not an array:", data);
        }
      } catch (error) {
        console.error("Error fetching agent status data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, []);

  const ExportApprovedCSV = () => {
    const header = "Employee Name,Project,Domain,Status,LastActivityTime";
    let content = "";

    agentStatus?.forEach((employee: any) => {
      const employeeName = employee?.displayName;
      const project = employee?.project;
      employee?.domains.forEach((domain: any) => {
        const domainName = domain?.domain;
        const status = domain?.status;
        const lastActivityTime = domain?.lastCurrentDateTime
          ? new Date(domain.lastCurrentDateTime).toLocaleString("en-US", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: false,
            })
          : "Invalid date";
        content += `"${employeeName}","${project}","${domainName}","${status}","${lastActivityTime}"\n`;
      });
    });

    const finaldata = header + "\n" + content;
    const blob = new Blob([finaldata], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const filename = `${"AgentStatus"}`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename.replace(/ /g, "_");
    link.click();
  };

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

  const AgentStatus = agentStatus
    ? agentStatus.filter((item: any) =>
        Object.values(item).some(
          (value: any) =>
            value &&
            typeof value === "string" &&
            value.toLowerCase().includes(searchQuery)
        )
      )
    : [];

    const authContext = useContext(AuthContext);

 
    if (!authContext) {
      throw new Error("AuthContext must be used within an AuthProvider");
    }
  
    const { sysadmin,admin } = authContext;
    const hasAccess = sysadmin == "true" || admin == "true" ;

  return (
<>
    { hasAccess && (
      
      <div className="mt-8 flex flex-wrap h-96 space-x-0 space-y-2 md:space-x-4 md:space-y-0 ">
      <div className="flex-1 bg-white p-4 shadow rounded-lg w-full  ">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start justify-between w-full">
          <h2 className="relative flex gap-2 items-center text-gray-500 text-lg font-semibold pb-1">
                  Agent Status
                  <ToolTip
                    text={
                      <React.Fragment>
                        <b>Background Monitor Status</b>
                        <br />
                        <ul className="list-disc pl-5 mt-2">
                          <li className="mt-2">
                            Verify if the background monitor application is
                            running for all users.
                          </li>

                          <li className="mt-2">
                            View the status specifically for the current date.
                          </li>

                          <li className="mt-2">
                            Quickly assess the monitoring status across all
                            users.
                          </li>
                        </ul>
                      </React.Fragment>
                    }
                  >
                    <HelpIcon />
                  </ToolTip>
                </h2>


            <div className="flex items-center justify-between w-full">
              <div>
                {new Date().toISOString().split("T")[0]} to{" "}
                {new Date().toISOString().split("T")[0]}
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
        </div>
        <div className="my-1"></div>
        <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div>
        <div className="flex flex-wrap justify-between  w-full h-96 overflow-y-scroll overscroll-x-none relative ">
      
          <div className="flex flex-wrap justify-between   overscroll-x-none relative">
            <table className="w-full  table-fixed ml-2 mt-1  text-sm text-center">
              <thead className="sticky top-0 z-2 bg-[#26C0BB] text-white">
                <tr className="w-full h-12">
                  <th
                    className="text-sm px-1 py-1 w-1/4"
                    style={{ minWidth: "120px" }}
                  >
                    Employee Name
                  </th>
                  <th
                    className="text-sm px-1 py-1 w-1/5"
                    style={{ minWidth: "120px" }}
                  >
                    Project
                  </th>
                  <th
                    className="text-sm px-1 py-1 w-1/5"
                    style={{ minWidth: "120px" }}
                  >
                    Domain
                  </th>
                  <th
                    className="text-sm px-1 py-1 w-1/5"
                    style={{ minWidth: "120px" }}
                  >
                    Status
                  </th>
                  <th
                    className="text-sm px-1 py-1 w-1/5  whitespace-nowrap"
                    style={{ minWidth: "120px" }}
                  >
                    Last Recorded Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      className="text-center py-9 px-4"
                      colSpan={4}
                      style={{ width: "100%" }}
                    >
                      <div style={{ display: "inline-block" }}>
                        <Spinner label="fetching data..." />
                      </div>
                    </td>
                  </tr>
                ) : (
                  AgentStatus.map((employee: any, index: number) => (
                    <React.Fragment key={index}>
                      {employee.domains.map(
                        (domain: any, domainIndex: number) => (
                          <tr key={`${index}-${domainIndex}`}>
                            {/* Employee Name (only for the first domain) */}
                            {domainIndex === 0 && (
                              <td
                                className="border-b-2 border-r-2 py-2"
                                rowSpan={employee.domains.length}
                              >
                                {employee.displayName}
                              </td>
                            )}
                            {/* Overall Status (only for the first domain) */}
                            {domainIndex === 0 && (
                              <td
                                className="border-b-2 border-r-2 py-2"
                                rowSpan={employee.domains.length}
                              >
                                {employee.project}
                              </td>
                            )}
                            {/* Domain */}
                            <td className="border-b-2 border-r-2 py-2">
                              {domain.domain.toLowerCase()}
                            </td>
                            {/* Domain Status */}
                            <td
                              className={`border-b-2 border-r-2 py-2 ${
                                domain.status === "Running"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {domain.status}
                            </td>
                            {/* Last Recorded Time */}
                            <td className="border-b-2 py-2">
                              {new Date(
                                domain.lastCurrentDateTime
                              ).toLocaleString("en-GB", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "numeric",
                                minute: "numeric",
                                second: "numeric",
                                hour12: false, // use 24-hour format
                              })}
                            </td>
                          </tr>
                        )
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex items-end justify-between data-bg">
          <button
            className="mt-6 px-3 py-1 rounded-sm border ml-auto bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] text-white border-gray-300"
            onClick={ExportApprovedCSV}
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
    
    ) 
    }
    </>
   
  );
};

export default AgentStatus;
