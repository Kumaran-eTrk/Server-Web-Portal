import {
  Button,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  Input,
  InputOnChangeData,
  TableCellLayout,
  TableColumnDefinition,
  createTableColumn,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";
import { Search16Regular } from "@fluentui/react-icons";
import React, { useEffect, useState } from "react";
import api from "../../../../interceptors";
import ToolTip from "../../../../shared/tooltip";
import { CancelIcon, HelpIcon } from "../../../../shared/icons";

export type Item = {
  id: string;
  name: string;
  version: string;
  browser: string;
  permissions: string;
  buttonfield?: JSX.Element;
};
const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("20px"),
    maxWidth: "400px",
    "> div": {
      display: "flex",
      flexDirection: "column",
      ...shorthands.gap("2px"),
    },
  },
});
const UserCompliance = () => {
  const [extensionCompliance, setExtensionCompliance] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const styles = useStyles();
  useEffect(() => {
    const fetchextensionComplianceData = async () => {
      try {
        const response = await api.get(`/extensions/rejectedusage`);
        const data = response.data;

        const sortedData = data.sort((a: any, b: any) => {
          const userNameA = (a.users[0]?.username || "").toLowerCase(); // Adding null check for users array and its properties
          const userNameB = (b.users[0]?.username || "").toLowerCase(); // Adding null check for users array and its properties
          return userNameA.localeCompare(userNameB);
        });

        setExtensionCompliance(sortedData);
      } catch (error) {
        console.error("Error Extension Compliance Data:", error);
      }
    };

    fetchextensionComplianceData();
  }, []);

  const handleSearchBoxChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => {
    const newValue = data?.value || "";
    setSearchQuery(newValue.toLowerCase());
  };

  const filteredextension = extensionCompliance.filter((item: Item) =>
    Object.values(item).some(
      (value: any) =>
        value &&
        typeof value === "string" &&
        value.toLowerCase().includes(searchQuery)
    )
  );

  const handleClear = () => {
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const ExportApprovedCSV = () => {
    const header = "UserName,ExtensionName,InstalledTime,LastRecordedTime";
    let content = "";

    extensionCompliance?.map((element: any, _i: any) => {
      const userName = element?.users[0]?.username || "Unknown"; // Adding null checks for users array and its properties
      const extensionName = element?.extensionName || "Unknown";
      const startDateTime =
        element?.users[0]?.startDateTime === "<NULL>"
          ? "Invalid date"
          : element?.users[0]?.startDateTime;
      const modifiedDateTime =
        element?.users[0]?.modifiedDateTime === "<NULL>"
          ? "Invalid date"
          : element?.users[0]?.modifiedDateTime;
      content += `"${userName}","${extensionName}","${startDateTime}","${modifiedDateTime}"\n`;
    });
    const finaldata = header + "\n" + content;
    const blob = new Blob([finaldata], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const filename = `${"ExtensionCompliance"}`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename.replace(/ /g, "_");
    link.click();
  };
  const columns: TableColumnDefinition<Item>[] = [
    createTableColumn<Item>({
      columnId: "Username",
      renderHeaderCell: () => "Username",
      renderCell: (item: any) => item.users[0]?.username,
    }),
    createTableColumn<Item>({
      columnId: "Extension Name",
      renderHeaderCell: () => "Extension",
      renderCell: (item: any) => {
        const status = item.extensionName;
        return (
          <TableCellLayout style={{ color: "#ef4444" }}>
            {status}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<any>({
      columnId: "Browser",
      renderHeaderCell: () => "Browser",
      renderCell: (item) => item.users[0]?.browser,
    }),
    createTableColumn<Item>({
      columnId: "Installed Time",
      renderHeaderCell: () => "Installed Time",
      renderCell: (item: any) =>
        item.users[0]?.startDateTime.split(".")[0].replace("T", " "),
    }),
    createTableColumn<Item>({
      columnId: "Last Recorded Time",
      renderHeaderCell: () => "Recorded Time",
      renderCell: (item: any) =>
        item.users[0]?.modifiedDateTime.split(".")[0].replace("T", " "),
    }),
  ];

  return (
    <div className="mt-8 flex flex-wrap space-x-0 space-y-2 md:space-x-4 md:space-y-0 ">
      <div className="flex-1 bg-white p-4 shadow-md rounded-lg w-full h-auto md:w-1/2">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start justify-between ">
            <h2 className="relative flex gap-2 items-center text-gray-500 text-lg font-semibold pb-1">
              User Complaince Extension Details
              <ToolTip
                text={
                  <React.Fragment>
                    <b>User History</b>
                    <br />
                    <ul className="list-disc pl-5">
                      <li className="mt-2">
                        See the history of users who installed rejected browser
                        extension along with usage days.
                      </li>
                      <li className="mt-2">
                        Export these details as a CSV file.
                      </li>
                    </ul>
                  </React.Fragment>
                }
              >
                <HelpIcon />
              </ToolTip>
            </h2>
            <div className="flex text-sm">
              {new Date().toISOString().split("T")[0]} to{" "}
              {new Date().toISOString().split("T")[0]}
            </div>
          </div>
        </div>
        <div className="my-1"></div>
        <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px my-1"></div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "10px",
          }}
        >
          <div className={styles.root}>
            <div ref={inputRef}>
              <Input
                onChange={handleSearchBoxChange}
                size="large"
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
        {/* <div className="flex flex-wrap justify-between  max-h-450 overflow-y-scroll overscroll-x-none relative ">
          <table className="w-full table-auto ml-2 text-sm text-center">
          <thead className="sticky top-0.5 z-0 bg-[#26C0BB] text-white">
  <tr className="w-full h-12">
    <th className="text-sm px-8 py-1" style={{ minWidth: '120px' }}>UserName</th>
    <th className="text-sm px-8 py-1" style={{ minWidth: '120px' }}>Extension</th>
    <th className="text-sm px-8 py-1" style={{ minWidth: '120px' }}>Installation Time</th>
    <th className="text-sm px-8 py-1 w-28 whitespace-nowrap" style={{ minWidth: '120px' }}>Last Recorded Time</th>
  </tr>
</thead>
            <tbody>
            {extensionCompliance.length === 0 ? (
  // If agentStatus is empty
  <tr>
    <td className="text-center text-gray-500 py-4" colSpan={3}>
      No records found
    </td>
  </tr>
) : (
  // If agentStatus has records, map over them
  extensionCompliance.map((item: any, index): any => (
    <tr key={index}>
      <td className="border-b-2 py-2">{item.username}</td>
      <td className={`border-b-2 py-2 `}>
        {item.name}
      </td>
      <td className="border-b-2 py-3 px-4">
        {new Date(item.startDateTime).toLocaleString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false // use 24-hour format
        })}
      </td>
      <td className="border-b-2 py-3 px-4">
        {new Date(item.modifiedDatetime).toLocaleString('en-US', {
          day: 'numeric',
          year: 'numeric',
          month: 'numeric',
          
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false // use 24-hour format
        })}
      </td>
    </tr>
  ))
)}

            </tbody>
          </table>
          
        </div> */}
        <DataGrid items={filteredextension} columns={columns}>
          <div className="">
            <DataGridHeader>
              <DataGridRow>
                {({ renderHeaderCell }: any) => (
                  <DataGridHeaderCell
                    style={{ backgroundColor: "#26C0BB", color: "white" }}
                  >
                    {renderHeaderCell()}
                  </DataGridHeaderCell>
                )}
              </DataGridRow>
            </DataGridHeader>
          </div>
          <div
            className="table-container"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            <DataGridBody<Item>>
              {({ item, rowId }: any) => (
                <DataGridRow<Item> key={rowId}>
                  {({ renderCell }: any) => (
                    <DataGridCell>{renderCell(item)}</DataGridCell>
                  )}
                </DataGridRow>
              )}
            </DataGridBody>
            {extensionCompliance.length <= 0 && (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                {/* <Text align="center" size={300} weight='medium' style={{color:'#9ca3af'}}>No data found</Text> */}
              </div>
            )}
          </div>
        </DataGrid>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "8px",
          }}
        >
          {/* <Toaster toasterId={toasterId} /> */}
          <Button
            style={{ backgroundColor: "#26C0BB", color: "white" }}
            appearance="primary"
            onClick={ExportApprovedCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserCompliance;
