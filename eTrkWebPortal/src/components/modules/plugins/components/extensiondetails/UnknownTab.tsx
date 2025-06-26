import { IStackTokens, Stack } from "@fluentui/react";
import {
  Button,
  createTableColumn,
  DataGrid,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  Input,
  InputOnChangeData,
  makeStyles,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  shorthands,
  Spinner,
  TableCellLayout,
  TableColumnDefinition,
  Text,
  Tooltip
} from "@fluentui/react-components";
import { LockClosedKeyRegular, Search16Regular } from "@fluentui/react-icons";
import React, { memo, useEffect, useState } from "react";
import { FixedSizeList as List } from "react-window";
import api from "../../../../interceptors";
import { CancelIcon } from "../../../../shared/icons";
import { ApproveConformationPopup } from "./confirmationpopup/ApproveConfirmationPopup";
import { RejectConformationPopup } from "./confirmationpopup/RejectConfirmationPopup";

interface IListWidgetProps {}

const stackTokens: IStackTokens = { childrenGap: 10 };

export type Item = {
  id: string;
  name: string;
  version:string;
  browser: string;
  permissions: string;
  buttonfield?: JSX.Element;
};

const useStyles = makeStyles({
  contentHeader: {
    marginTop: "0",
  },
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

const ApprovePermissions = ({ permissions }: { permissions: any }) => {
  const styles = useStyles();
  return (
    <div>
      <h3 className={styles.contentHeader}>Permissions</h3>
      <ul>{permissions}</ul>
    </div>
  );
};

const UnknownTab: React.FC<IListWidgetProps> = () => {
  const [browserExtension, setBrowserExtension] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const styles = useStyles();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchBrowserExtensionData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/extensions/unknownstatus`);
        const data = response.data;
        const sortedData = data.sort((a: any, b: any) => {
          const userNameA = a.name.toLowerCase();
          const userNameB = b.name.toLowerCase();
          return userNameA.localeCompare(userNameB);
        });
        console.log("DATA", sortedData);
        setBrowserExtension(sortedData);
      } catch (error) {
        console.error("Error fetching Extension data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrowserExtensionData();
  }, []);

  const handleSearchBoxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => {
    const newValue = data?.value || "";
    setSearchQuery(newValue.toLowerCase());
  };

  const filteredExtension = browserExtension.filter((item: any) =>
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

  const columns: TableColumnDefinition<Item>[] = [
    createTableColumn<Item>({
      columnId: "ExtensionName",
      renderHeaderCell: () => "Extension Name",
      renderCell: (item) => {
        const status = item.name;
        return (
          <TableCellLayout style={{ color: "#ef4444" }}>
            {status}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: "Version",
      renderHeaderCell: () => "Version",
      renderCell: (item) => item.version,
    }),
    createTableColumn<Item>({
      columnId: "Browser",
      renderHeaderCell: () => "Browser",
      renderCell: (item) => item.browser,
    }),

    createTableColumn<Item>({
      columnId: "Permissions",
      renderHeaderCell: () => "Permissions",
      renderCell: (item) => {
        if (item.permissions !== null) {
          const permissionsArray = item.permissions.split(",");
          const formattedPermissions = permissionsArray.map((permission) => (
            <li key={permission}>{permission.trim()}</li>
          ));
          return (
            <>
              <Popover>
                <PopoverTrigger disableButtonEnhancement>
                  <Button icon={<LockClosedKeyRegular />}>Permissions</Button>
                </PopoverTrigger>

                <PopoverSurface tabIndex={-1}>
                  <ApprovePermissions permissions={formattedPermissions} />
                </PopoverSurface>
              </Popover>
            </>
          );
        }
        return null;
      },
    }),
    createTableColumn<Item>({
      columnId: "Approve/Reject",
      renderHeaderCell: () => "Approve/Reject",
      renderCell: (item: any) => {
        return (
          <TableCellLayout>
            <Stack tokens={stackTokens}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "4px",
                }}
              >
                <Tooltip content="Approve" relationship="label">
                  <ApproveConformationPopup
                    setBrowserExtension={setBrowserExtension}
                    extensionName={item.name}
                    extensionVersion={item.version}
                    extensionId={item.id}
                  />
                </Tooltip>
                <Tooltip content="Reject" relationship="label">
                  <RejectConformationPopup
                    setBrowserExtension={setBrowserExtension}
                    extensionName={item.name}
                    extensionVersion={item.version}
                    extensionId={item.id}
                  />
                </Tooltip>
              </div>
            </Stack>
          </TableCellLayout>
        );
      },
    }),
  ];

  const Row = ({ index, style }: any) => {
    const item = filteredExtension[index];
    return (
      <>
        <div style={style}>
          <DataGridRow<Item> key={index}>
            {({ renderCell }: any) => (
              <DataGridCell>{renderCell(item)}</DataGridCell>
            )}
          </DataGridRow>
        </div>
      </>
    );
  };
  return (
    <div role="tabpanel" aria-labelledby="Unknown">
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
      <div className="widget-body">
        <div className="">
          {loading ? (
            <div className="flex items-center justify-center w-full">
              <div>
                <Spinner label="fetching data..." />
              </div>
            </div>
          ) : (
            <DataGrid items={filteredExtension} columns={columns}>
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
           

                <List
                  height={400}
                  itemCount={filteredExtension.length}
                  itemSize={50} 
                  width="100%"
                >
                  {Row}
                </List>
                {browserExtension.length <= 0 && (
                  <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <Text
                      align="center"
                      size={300}
                      weight="medium"
                      style={{ color: "#9ca3af" }}
                    >
                      No data found
                    </Text>
                  </div>
                )}
              </div>
            </DataGrid>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default memo(UnknownTab);
