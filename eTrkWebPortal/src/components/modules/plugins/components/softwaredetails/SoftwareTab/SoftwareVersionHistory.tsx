import { useEffect, useState } from "react";
import {
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridHeaderCell,
  DataGridCell,
  TableCellLayout,
  DataGridBody,
} from "@fluentui/react-components";
import {
  createTableColumn,
  TableColumnDefinition,
} from "@fluentui/react-components";
import { Text } from "@fluentui/react-components";
import api from "../../../../../interceptors";

export type Item = {
  modifiedDatetime: string;
  modifiedByUser: string;
  remarks: string;
  editversion: string;
};

const SoftwareVersionHistory = ({ softwareId }: { softwareId: any }) => {
  const [versionHistory, setVersionHistory] = useState([]);

  useEffect(() => {
    const fetchVersionHistoryData = async () => {
      try {
        const response = await api.get(`/softwares/history/${softwareId}`);
        const data = response.data;
        const sortedData = data.sort((a: any, b: any) => {
          const versionA = a.editVersion;
          const versionB = b.editVersion;
          return versionA.localeCompare(versionB);
        });

        setVersionHistory(sortedData);
      } catch (error) {
        console.error("Error fetching version history data:", error);
      }
    };

    fetchVersionHistoryData();
  }, []);

  const columns: TableColumnDefinition<any>[] = [
    createTableColumn<Item>({
      columnId: "Version",
      renderHeaderCell: () => "Version",
      renderCell: (item: any) => item.editVersion,
    }),
    createTableColumn<Item>({
      columnId: "Remarks",
      renderHeaderCell: () => "Remarks",
      renderCell: (item: any) => {
        const status = item.remarks;
        return (
          <TableCellLayout style={{ color: "#ef4444" }}>
            {status}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: "Modified by",
      renderHeaderCell: () => "Modified By",
      renderCell: (item) => item.modifiedByUser,
    }),
    createTableColumn<any>({
      columnId: "Modified Date",
      renderHeaderCell: () => "Modified Date",
      renderCell: (item) =>
        item.modifiedDateTime.split(".")[0].replace("T", " "),
    }),
  ];

  return (
    <>
      <DataGrid items={versionHistory} columns={columns}>
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
          {versionHistory.length <= 0 && (
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
    </>
  );
};

export default SoftwareVersionHistory;
