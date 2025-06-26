import React, { memo, useEffect, useState } from "react";
import {
  Text,
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridHeaderCell,
  DataGridCell,
  TableCellLayout,
  DataGridBody,
  shorthands,
  InputOnChangeData,
  Input,
} from "@fluentui/react-components";
import {
  createTableColumn,
  TableColumnDefinition,
} from "@fluentui/react-components";
import api from "../../../../../interceptors";
import { makeStyles } from "@fluentui/react-components";

import { CancelIcon } from "../../../../../shared/icons";
import { Search16Regular } from "@fluentui/react-icons";
import { SoftwareEditHistoryTab } from "./SoftwareVersionHistoryTab";
import { UpdateRejectSoftwarePopup } from "../softwareconfirmationpopup/UpdateRejectSoftwarePopup";

export type Item = {
  id: string;
  name: string;
  version: string;

  history: JSX.Element;
  buttonfield: JSX.Element;
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

const ApproveSoftwareTab = () => {
  const [updateSoftwareApprove, setUpdateSoftwareApprove] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const styles = useStyles();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchApprovedSoftwareData = async () => {
      try {
        const response = await api.get(`/softwares/acceptedstatus`);
        const data = response.data;
        const sortedData = data.sort((a: any, b: any) => {
          const userNameA = a.name.toLowerCase();
          const userNameB = b.name.toLowerCase();
          return userNameA.localeCompare(userNameB);
        });

        setUpdateSoftwareApprove(sortedData);
      } catch (error) {
        console.error("Error fetching Extension data:", error);
      }
    };

    fetchApprovedSoftwareData();
  }, []);

  const handleSearchBoxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => {
    const newValue = data?.value || "";
    setSearchQuery(newValue.toLowerCase());
  };

  const filteredSoftware = updateSoftwareApprove.filter((item: Item) =>
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
      columnId: "Edit History",
      renderHeaderCell: () => "Edit History",
      renderCell: (item) => {
        return (
          <TableCellLayout>
            <SoftwareEditHistoryTab softwareId={item.id} />
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: "Edit",
      renderHeaderCell: () => "Edit",
      renderCell: (item) => {
        return (
          <TableCellLayout>
            <UpdateRejectSoftwarePopup
              setUpdateSoftwareApprove={setUpdateSoftwareApprove}
              softwareId={item.id}
            />
          </TableCellLayout>
        );
      },
    }),
  ];

  return (
    <div role="tabpanel" aria-labelledby="Approved">
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
              <DataGridBody<Item>>
                {({ item, rowId }: any) => (
                  <DataGridRow<Item> key={rowId}>
                    {({ renderCell }: any) => (
                      <DataGridCell>{renderCell(item)}</DataGridCell>
                    )}
                  </DataGridRow>
                )}
              </DataGridBody>
              {updateSoftwareApprove.length <= 0 && (
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
        </div>
      </div>
    </div>
  );
};

export default memo(ApproveSoftwareTab);
