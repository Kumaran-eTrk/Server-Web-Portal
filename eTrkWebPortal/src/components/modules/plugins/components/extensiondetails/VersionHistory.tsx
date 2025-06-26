import {
  createTableColumn,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  TableColumnDefinition,
  Text,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";
import api from "../../../../interceptors";

interface IListWidgetProps {}

export type Item = {
  modifieddatetime: string;
  modifiedbyuser: string;
  remarks: string;
  version: string;
};

const VersionHistory = ({ extensionId }: { extensionId: any }) => {
  const [versionHistory, setVersionHistory] = useState([]);

  useEffect(() => {
    const fetchVersionHistoryData = async () => {
      try {
        const response = await api.get(`/extensions/history/${extensionId}`);
        const data = response.data;
        const sortedData = data.sort((a: any, b: any) => {
          const versionA = a.updateversion;
          const versionB = b.updateversion;
          return versionA.localeCompare(versionB);
        });
        console.log("history", sortedData);
        setVersionHistory(sortedData);
      } catch (error) {
        console.error("Error fetching version history data:", error);
      }
    };

    fetchVersionHistoryData();
  }, []);

  const columns: TableColumnDefinition<Item>[] = [
    createTableColumn<Item>({
      columnId: "Version",
      renderHeaderCell: () => "Version",
      renderCell: (item: any) => item.updateversion,
    }),

    createTableColumn<Item>({
      columnId: "Remarks",
      renderHeaderCell: () => "Remarks",
      renderCell: (item: any) => item.remarks,
    }),

    createTableColumn<Item>({
      columnId: "Modified by",
      renderHeaderCell: () => "Modified By",
      renderCell: (item) => item.modifiedbyuser,
    }),
    createTableColumn<Item>({
      columnId: "Modified Date",
      renderHeaderCell: () => "Modified Date",
      renderCell: (item) =>
        item.modifieddatetime.split(".")[0].replace("T", " "),
    }),
  ];

  return (
    <DataGrid items={versionHistory} columns={columns}>
      <div className="">
        <DataGridHeader>
          <DataGridRow>
            {({ renderHeaderCell }: any) => (
              <DataGridHeaderCell
                style={{ backgroundColor: "#444791", color: "white" }}
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
  );
};

export default VersionHistory;
