import * as React from "react";
import {
  Spinner,
  makeStyles,
  shorthands,
  InputOnChangeData,
} from "@fluentui/react-components";
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
  Input,
  Button,
} from "@fluentui/react-components";
import {
  EditRegular,
  Search16Regular,
  Save16Regular,
} from "@fluentui/react-icons";
import api from "../../../../../interceptors";
import { CancelIcon } from "../../../../../shared/icons";
import { UnMatchedApplication } from "./UnmatchedApplication";
import { toast } from "react-toastify";
import { useUserDataRangeContext } from "../../../../../contexts/user-data-context";
import { DeleteApplication } from "./DeleteApplication";

type ApplicationCell = {
  applicationString: string;
};
type EditCell = {
  newaApplications: JSX.Element;
};
type toggleCell = {
  isProductive: boolean;
};

type Item = {
  applicationString: ApplicationCell;
  newApplications: EditCell;
  isProductive: toggleCell;
};

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("20px"),
    maxWidth: "200px",
    "> div": {
      display: "flex",
      flexDirection: "column",
      ...shorthands.gap("2px"),
    },
  },
});

export const GetApplication = () => {
  const [loading, setLoading] = React.useState(false);
  const [Id, setId] = React.useState("");
  const { getNewApplicationData, setGetNewApplicationData }: any =
    useUserDataRangeContext();
  const [editName, setEditName] = React.useState("");
  const [changeButton, setChangeButton] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const styles = useStyles();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchBoxChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => {
    const newValue = data?.value || "";
    setSearchQuery(newValue.toLowerCase());
  };

  const searchApplication = getNewApplicationData.filter((item: Item) =>
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
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(event.target.value);
  };

  const handleSaveChange = async (application: string) => {
    try {
      if (!editName) {
        return;
      }

      const dataToPost = {
        applicationName: application,
        alternativeName: editName,
      };
      const response = await api.put(
        `/adminscreen/updateapplications/${Id}`,
        dataToPost
      );
      console.log("Data", response);
      if (response.status === 200) {
        toast.success("Changes saved successfully");
        setChangeButton(false);
        setEditName("");
        const response = await api.get("/adminscreen/getapplications");
        const data = response.data;
        setGetNewApplicationData(data);
      }
    } catch (error) {
      toast.error("Failed to save changes");
      console.error("Error in posting data:", error);
    }
  };

  const handleFetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/adminscreen/getapplications`);

      const data = response.data;
      setGetNewApplicationData(data);
      if (response.status === 201) {
        // toast.success("Changes saved successfully");
      }
    } catch (error) {
      console.error("Error posting data:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleFetchData();
  }, []);

  const columns: TableColumnDefinition<Item>[] = [
    createTableColumn<Item>({
      columnId: "Application name",
      renderHeaderCell: () => {
        return "Application name";
      },
      renderCell: (item: any) => {
        return (
          <>
            {changeButton && Id === item.id ? (
              <>
                <Input
                  value={editName}
                  onChange={handleInputChange}
                  placeholder={item.alternativeName}
                  required
                />
              </>
            ) : (
              <TableCellLayout style={{ wordBreak: "break-all" }}>
                {item.alternativeName}
              </TableCellLayout>
            )}
          </>
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
          <TableCellLayout style={{ wordBreak: "break-all" }}>
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
        return (
          <TableCellLayout style={{ wordBreak: "break-all" }}>
            {date}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: "Edit",
      renderHeaderCell: () => {
        return "";
      },
      renderCell: (item: any) => {
        return (
          <TableCellLayout style={{ wordBreak: "break-all" }}>
            <div>
              {changeButton && Id === item.id ? (
                <Button
                  icon={<Save16Regular />}
                  onClick={() => {
                    handleSaveChange(item.applicationName);
                  }}
                ></Button>
              ) : (
                <Button
                  icon={<EditRegular />}
                  onClick={() => {
                    setChangeButton(true);
                    setId(item.id);
                  }}
                ></Button>
              )}
              <DeleteApplication Id={item.id} />
            </div>
          </TableCellLayout>
        );
      },
    }),
  ];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <UnMatchedApplication />
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
      <div style={{ width: "auto", gap: 10, marginTop: "10px" }}>
        <DataGrid
          items={searchApplication}
          columns={columns}
          //   sortable
          //   selectionMode="multiselect"
          getRowId={(item) => item.applicationString}
        >
          <DataGridHeader>
            <DataGridRow
              // selectionCell={{
              //     checkboxIndicator: { "aria-label": "Select all rows" },
              //   }}
              style={{ backgroundColor: "#26C0BB" }}
            >
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
            {loading ? (
              <Spinner style={{ margin: 50 }} label="fetching data..." />
            ) : (
              <>
                <DataGridBody<Item>>
                  {({ item, rowId }: any) => (
                    <DataGridRow<Item>
                      key={rowId}
                      // selectionCell={{ "aria-label": "Select all rows" }}
                    >
                      {({ renderCell }) => (
                        <DataGridCell>{renderCell(item)}</DataGridCell>
                      )}
                    </DataGridRow>
                  )}
                </DataGridBody>
              </>
            )}
          </div>
        </DataGrid>
      </div>
    </>
  );
};
