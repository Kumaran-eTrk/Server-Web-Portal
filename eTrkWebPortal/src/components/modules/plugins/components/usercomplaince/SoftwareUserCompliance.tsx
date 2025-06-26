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
  version:string;
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
const SoftwareUserCompliance = () => {
  const [softwareCompliance, setSoftwareCompliance] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const styles = useStyles();
  useEffect(() => {
    const fetchSoftwareComplianceData = async () => {
      try {
        const response = await api.get(`/softwares/rejectedusage`);
        const data = response.data;
        // setExtensionCompliance(data);
        //console.log(extensionCompliance)
        console.log("usage software", data);
        const sortedData = data.sort((a: any, b: any) => {
          const userNameA = (a.users[0]?.username || "").toLowerCase(); // Adding null check for users array and its properties
          const userNameB = (b.users[0]?.username || "").toLowerCase(); // Adding null check for users array and its properties
          return userNameA.localeCompare(userNameB);
        });

        setSoftwareCompliance(sortedData);
      } catch (error) {
        console.error("Error Extension Compliance Data:", error);
      }
    };

    fetchSoftwareComplianceData();
  }, []);

  const handleSearchBoxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => {
    const newValue = data?.value || "";
    setSearchQuery(newValue.toLowerCase());
  };

  const filteredextension = softwareCompliance.filter((item: Item) =>
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

    softwareCompliance?.map((element: any, _i: any) => {
      const userName = element?.users[0]?.username || "Unknown"; // Adding null checks for users array and its properties
      const softwareName = element?.softwareName || "Unknown";
      const startDateTime =
        element?.users[0]?.startDateTime === "<NULL>"
          ? "Invalid date"
          : element?.users[0]?.startDateTime;
      const modifiedDateTime =
        element?.users[0]?.modifiedDateTime === "<NULL>"
          ? "Invalid date"
          : element?.users[0]?.modifiedDateTime;
      content += `"${userName}","${softwareName}","${startDateTime}","${modifiedDateTime}"\n`;
    });

    const finaldata = header + "\n" + content;
    const blob = new Blob([finaldata], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const filename = `${"SoftwareCompliance"}`;

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
      columnId: "Software Name",
      renderHeaderCell: () => "Software",
      renderCell: (item: any) => {
        const status = item.softwareName;
        return (
          <TableCellLayout style={{ color: "#ef4444" }}>
            {status}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<any>({
      columnId: "Version",
      renderHeaderCell: () => "Version",
      renderCell: (item) => item.version,
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
              User Complaince Software Details
              <ToolTip
                text={
                  <React.Fragment>
                    <b>User History</b>
                    <br />
                    <ul className="list-disc pl-5">
                      <li className="mt-2">
                        See the history of users who installed rejected software
                        along with usage days.
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
            </h2>{" "}
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
            {softwareCompliance.length <= 0 && (
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

export default SoftwareUserCompliance;
