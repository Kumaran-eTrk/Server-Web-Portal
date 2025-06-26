import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  Tooltip,
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
import { Add16Regular, Search16Regular } from "@fluentui/react-icons";

import { toast } from "react-toastify";
import api from "../../../../../interceptors";
import { CancelIcon } from "../../../../../shared/icons";

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

export const UnMatchedApplication = () => {
  const [loading, setLoading] = React.useState(false);
  const [applicationData, setApplicationData] = React.useState<Item[]>([]);
  const [editedApplicationName, setEditedApplicationName] =
    React.useState<string>("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const styles = useStyles();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedApplicationName(event.target.value);
  };

  const fetchNewApplicationData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/adminscreen/AppProductivity/unmatched");
      const data = response.data.map((appName: any) => ({
        applicationString: appName,
      }));
      setApplicationData(data);
    } catch (error) {
      toast.error("Error fetching Application data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchBoxChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => {
    const newValue = data?.value || "";
    setSearchQuery(newValue.toLowerCase());
  };

  const searchApplication = applicationData.filter((item: Item) =>
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

  const handleSaveChange = async (application: string) => {
    try {
      const dataToPost = {
        applicationName: application, // Original application name
        alternativeName: editedApplicationName, // Edited application name
      };
      const response = await api.post(
        `/adminscreen/createapplication`,
        dataToPost
      );
      const data = response.data;
      if (response.status === 201) {
        setEditedApplicationName("");
      }
      toast.success("Application added successfully ", { autoClose: 2000 });
    } catch (error) {
      toast.error("Error posting data");
    }
  };

  const columns: TableColumnDefinition<Item>[] = [
    createTableColumn<Item>({
      columnId: "Application name",
      renderHeaderCell: () => {
        return "Application name";
      },
      renderCell: (item: any) => {
        return (
          <TableCellLayout style={{ wordBreak: "break-all" }}>
            {item.applicationString}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: "Alternative Application Name",
      renderHeaderCell: () => {
        return "Alternative Application Name";
      },
      renderCell: (_item: any) => {
        return (
          <TableCellLayout style={{ wordBreak: "break-all" }}>
            <div ref={inputRef}>
              <Input
                style={{ marginRight: "20px" }}
                ref={inputRef}
                onChange={handleInputChange}
              />
            </div>
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: "Add",
      renderHeaderCell: () => {
        return "";
      },
      renderCell: (_item: any) => {
        return (
          <TableCellLayout
            style={{ wordBreak: "break-all", marginLeft: "60px" }}
          >
            <Button
              icon={<Add16Regular />}
              appearance="primary"
              onClick={() => handleSaveChange(_item.applicationString)}
              style={{ backgroundColor: "#26C0BB" }}
            ></Button>
          </TableCellLayout>
        );
      },
    }),
  ];

  return (
    <Dialog modalType="non-modal">
      <DialogTrigger disableButtonEnhancement>
        <Tooltip content="Add Application" relationship="label">
          <Button
            size="medium"
            style={{ marginLeft: "5px", marginBottom: "5px" }}
            onClick={fetchNewApplicationData}
          >
            Create New Application
          </Button>
        </Tooltip>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>New Applications</DialogTitle>
          <DialogContent>
            <br></br>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div className={styles.root}>
                <div ref={inputRef}>
                  <Input
                    onChange={handleSearchBoxChange}
                    size="large"
                    value={searchQuery}
                    contentBefore={<Search16Regular />}
                    contentAfter={
                      searchQuery ? (
                        <div
                          onClick={handleClear}
                          style={{ cursor: "pointer" }}
                        >
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
                getRowId={(item) => item.applicationString}
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
                  {loading ? (
                    <Spinner style={{ margin: 50 }} label="fetching data..." />
                  ) : (
                    <>
                      <DataGridBody<Item>>
                        {({ item, rowId }: any) => (
                          <DataGridRow<Item> key={rowId}>
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
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
