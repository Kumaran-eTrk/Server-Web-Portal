import { IStackTokens, Stack } from "@fluentui/react";
import {
  createTableColumn,
  DataGrid,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  Input,
  InputOnChangeData,
  makeStyles,
  shorthands,
  Spinner,
  TableCellLayout,
  TableColumnDefinition,
  Text,
  tokens,
  Tooltip,
} from "@fluentui/react-components";
import { Search16Regular } from "@fluentui/react-icons";
import React, { memo, useEffect, useState } from "react";
import { FixedSizeList as List } from "react-window";
import api from "../../../../../interceptors";
import { CancelIcon } from "../../../../../shared/icons";
import { SoftwareApprovePopup } from "../softwareconfirmationpopup/SoftwareApprovePopup";
import { SoftwareRejectPopup } from "../softwareconfirmationpopup/SoftwareRejectPopup";

interface IListWidgetProps {}

const stackTokens: IStackTokens = { childrenGap: 10 };

export type Item = {
  name: string;
  version: string;
  buttonfield: JSX.Element;
};

const useStyles = makeStyles({
  contentHeader: {
    marginTop: "0",
  },
  base: {
    display: "flex",
    // flexDirection: "column",
  },
  fieldWrapper: {
    ...shorthands.padding(
      tokens.spacingVerticalMNudge,
      tokens.spacingHorizontalMNudge
    ),
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

const UnknownSoftwareTab: React.FC<IListWidgetProps> = () => {
  const [UnknownSoftware, setUnknownSoftware] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const styles = useStyles();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchUnknownSoftwareData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/softwares/unknownstatus`);
        const data = response.data;
        const sortedData = data.sort((a: any, b: any) => {
          const userNameA = a.name.toLowerCase();
          const userNameB = b.name.toLowerCase();
          return userNameA.localeCompare(userNameB);
        });

        setUnknownSoftware(sortedData);
      } catch (error) {
        console.error("Error fetching Extension data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnknownSoftwareData();
  }, []);

  const handleSearchBoxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => {
    const newValue = data?.value || "";
    setSearchQuery(newValue.toLowerCase());
  };

  const filteredSoftware = UnknownSoftware.filter((item: Item) =>
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
      columnId: "SoftwareName",
      renderHeaderCell: () => "Software Name",
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
                  <SoftwareApprovePopup
                    setUnknownSoftware={setUnknownSoftware}
                    softwareName={item.name}
                    softwareVersion={item.version}
                    softwareId={item.id}
                  />
                </Tooltip>
                <Tooltip content="Reject" relationship="label">
                  <SoftwareRejectPopup
                    setUnknownSoftware={setUnknownSoftware}
                    softwareName={item.name}
                    softwareVersion={item.version}
                    softwareId={item.id}
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
    const item = filteredSoftware[index];
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
            <DataGrid items={filteredSoftware} columns={columns}>
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
                  itemCount={filteredSoftware.length}
                  itemSize={50} // Adjust row height
                  width="100%"
                >
                  {Row}
                </List>

                {UnknownSoftware.length <= 0 && (
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

export default memo(UnknownSoftwareTab);
