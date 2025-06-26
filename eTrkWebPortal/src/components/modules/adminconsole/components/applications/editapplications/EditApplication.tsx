import * as React from "react";
import {
  DataGridBody,
  DataGridRow,
  DataGrid,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridCell,
  TableCellLayout,
  TableColumnDefinition,
  createTableColumn,
  makeStyles,
  shorthands,
  InputOnChangeData,
  Input,
  Text,
  Spinner,
} from "@fluentui/react-components";

import { Stack, IStackTokens } from "@fluentui/react/lib/Stack";
import { Toggle } from "@fluentui/react/lib/Toggle";
import api from "../../../../../interceptors";
import { CancelIcon } from "../../../../../shared/icons";
import { Search16Regular } from "@fluentui/react-icons";
import { AddApplicationPopup } from "../addapplications/AddApplicationPopup";
import { useUserDataRangeContext } from "../../../../../contexts/user-data-context";
import { Application } from "../addapplications/Application";
import ProjectDropdown from "../../../../../shared/dropdown/Projectdropdown";
import { toast } from "react-toastify";

const stackTokens: IStackTokens = { childrenGap: 5 };

type Item = {
  applicationId: string;
  applicationName: string;
  productive: boolean;
  modifiedBy: string;
  modifiedDatetime: string;
  applications: string[];
};

type DataPost = {
  projectId: string;
  applicationId: string;
  newProductivity: boolean;
};

const useStyles = makeStyles({
  contentHeader: {
    marginTop: "0",
  },
  comboroot: {
    display: "grid",
    gridTemplateRows: "repeat(1fr)",
    justifyItems: "start",
    ...shorthands.gap("2px"),
    minWidth: "30px", // Adjust this value to your desired width
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
  listbox: {
    maxHeight: "300px",
  },
});

const EditApplication = () => {
  const { getApplicationData, setGetApplicationData, selectedProjectId }: any =
    useUserDataRangeContext();
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const styles = useStyles();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSearchBoxChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => {
    const newValue = data?.value || "";
    setSearchQuery(newValue.toLowerCase());
  };

  const editApplicationSearch = getApplicationData
    ? getApplicationData.filter((item: Item) =>
        Object.values(item).some(
          (value: any) =>
            value &&
            typeof value === "string" &&
            value.toLowerCase().includes(searchQuery)
        )
      )
    : [];

  const handleClear = () => {
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleToggleChange = async (applicationId: any, checked: any) => {
    try {
      const dataToPost: DataPost = {
        projectId: selectedProjectId[0],
        newProductivity: checked,
        applicationId: applicationId,
      };
      const responses = await api.put(
        `/adminscreen/updateprojectapplications`,
        dataToPost
      );

      if (responses.status === 200) {
        toast.success("updated successfully");
      } else {
        toast.error("Failed to update");
      }
      const response = await api.post(
        `/adminscreen/getappproductivity?projectId=${selectedProjectId.length > 0 ? selectedProjectId[0] : ""}`
      );
      const data = response.data;
      const sortedApplications = data.applications.sort((a: any, b: any) => {
        if (a.applicationName < b.applicationName) return -1;
        if (a.applicationName > b.applicationName) return 1;
        return 0;
      });

      setGetApplicationData(sortedApplications);
      if (responses.status === 204) {
        toast.success("updated successfully");
      }
    } catch (error) {
      console.error("Error toggling Productive/Unproductive status:", error);
    }
    fetchApplicationdata();
  };

  const fetchApplicationdata = async () => {
    try {
      setLoading(true);
      const response = await api.post(
        `/adminscreen/getappproductivity?projectId=${selectedProjectId[0]}`
      );
      const data = response.data;
      const sortedApplications = data.applications.sort((a: any, b: any) => {
        if (a.applicationName < b.applicationName) return -1;
        if (a.applicationName > b.applicationName) return 1;
        return 0;
      });

      setGetApplicationData(sortedApplications);
    } catch (error) {
      console.error("Error fetching Application data:");
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    fetchApplicationdata();
  }, [selectedProjectId[0]]);

  const togglestyles = {
    text: {
      color: "#6b7280",
    },
  };

  const columns: TableColumnDefinition<Item>[] = [
    createTableColumn<Item>({
      columnId: "Application name",
      renderHeaderCell: () => {
        return "Application name";
      },
      renderCell: (item: any) => {
        return <TableCellLayout>{item.alternativeName}</TableCellLayout>;
      },
    }),
    createTableColumn<Item>({
      columnId: "Productive/Unproductiver",
      renderHeaderCell: () => {
        return "Productive/Unproductive";
      },
      renderCell: (item: any) => {
        return (
          <TableCellLayout>
            <Stack tokens={stackTokens}>
              <div className="text-170">
                <Toggle
                  checked={item.productive}
                  onChange={(_, checked) =>
                    handleToggleChange(item.applicationId, checked)
                  }
                  onText="Productive"
                  offText="Unproductive"
                  styles={togglestyles}
                />
              </div>
            </Stack>
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: "Modified By",
      renderHeaderCell: () => {
        return "Modified By";
      },
      renderCell: (item: any) => {
        return (
          <TableCellLayout
            style={{ wordBreak: "break-all", marginLeft: "30px" }}
          >
            {item.modifiedBy}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: "Modified Date",
      renderHeaderCell: () => {
        return "Modified Date";
      },
      renderCell: (item: any) => {
        const date =
          item.modifiedDatetime !== null
            ? item.modifiedDatetime.split("T")[0]
            : "Invalid date";
        // console.log(item.modifiedTime)
        return (
          <TableCellLayout style={{ wordBreak: "break-all" }}>
            {date}
          </TableCellLayout>
        );
      },
    }),
  ];

  return (
    <div role="tabpanel" aria-labelledby="EditApplication">
      <div className="flex itesm-center justify-between my-2">
        <div className="flex items-center gap-3">
          <AddApplicationPopup />
          <Application />
        </div>
      </div>
      <div className="mt-2 mb-2 flex justify-between">
        <ProjectDropdown />
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

      <div>
        {loading ? (
          <div className="flex items-center justify-center w-full mt-6">
            <div>
              <Spinner label="fetching data..." />
            </div>
          </div>
        ) : (
          <DataGrid
            items={editApplicationSearch}
            columns={columns}
            // selectionMode="multiselect"
          >
            <DataGridHeader>
              <DataGridRow style={{ backgroundColor: "#26C0BB" }}>
                {({ renderHeaderCell }: any) => (
                  <DataGridHeaderCell
                    style={{ backgroundColor: "#26C0BB", color: "white" }}
                  >
                    {renderHeaderCell()}
                  </DataGridHeaderCell>
                )}
              </DataGridRow>
            </DataGridHeader>
            <div className="table-container">
              <DataGridBody<Item>>
                {({ item, rowId }) => (
                  <DataGridRow<Item> key={rowId}>
                    {({ renderCell }) => (
                      <DataGridCell>{renderCell(item)}</DataGridCell>
                    )}
                  </DataGridRow>
                )}
              </DataGridBody>
              {editApplicationSearch.length <= 0 && (
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
  );
};

export default React.memo(EditApplication);
