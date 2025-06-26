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

import { Search16Regular } from "@fluentui/react-icons";

import { AddUserRolePopup } from "../adduserrole/AddUserRole";
import { EditUserRolePopup } from "./EditUserRoleRow";
import { CreateRole } from "../role/GetRole";
import { DeleteRole } from "../role/DeleteUserPopUp";
import { useUserDataRangeContext } from "../../../../../../contexts/user-data-context";
import api from "../../../../../../interceptors";
import { CancelIcon } from "../../../../../../shared/icons";

export type UserRole = {
  displayname: string;
  useremail: string;
  rolename: string;
  modifiedBy: string;
  modifiedDatetime: string;
  buttonfield: JSX.Element;
};

export type Role = {
  roleId: string;
  roleName: string;
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
  control: {
    maxWidth: "150px",
  },
});

const EditUserRole = () => {
  const { userRoleData, setUserRoleData }: any = useUserDataRangeContext();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const styles = useStyles();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSearchBoxChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => {
    const newValue = data?.value || "";
    setSearchQuery(newValue.toLowerCase());
  };

  const editUserRoleSearch = userRoleData.filter((item: UserRole) =>
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

  React.useEffect(() => {
    const fetchUserRoledata = async () => {
      try {
        setLoading(true);
        const response = await api.get("/adminscreen/userroles");
        const data = response.data;
        const sortedData = data.sort((a: any, b: any) => {
          const dateA = new Date(a.modifiedDatetime);
          const dateB = new Date(b.modifiedDatetime);
          return dateB.getTime() - dateA.getTime();
        });
        setUserRoleData(sortedData);
      } catch (error) {
        console.error("Error fetching user role data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoledata();
  }, []);

  const columns: TableColumnDefinition<UserRole>[] = [
    createTableColumn<UserRole>({
      columnId: "Name",
      renderHeaderCell: () => {
        return "UserName";
      },
      renderCell: (item: any) => {
        return (
          <TableCellLayout style={{ wordBreak: "break-all" }}>
            {item.displayname}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<UserRole>({
      columnId: "email",
      renderHeaderCell: () => {
        return "Email";
      },
      renderCell: (item: any) => {
        return (
          <TableCellLayout style={{ wordBreak: "break-all" }}>
            {item.useremail}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<UserRole>({
      columnId: "role name",
      renderHeaderCell: () => {
        return "Role";
      },
      renderCell: (item: any) => {
        return (
          <TableCellLayout style={{ wordBreak: "break-all" }}>
            {item.rolename}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<UserRole>({
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
    createTableColumn<UserRole>({
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
    createTableColumn<UserRole>({
      columnId: "Edit",
      renderHeaderCell: () => {
        return "";
      },
      renderCell: (item: any) => {
        return (
          <TableCellLayout>
            <EditUserRolePopup id={item.id} />
            <DeleteRole Id={item.id} />
          </TableCellLayout>
        );
      },
    }),
  ];

  return (
    <div role="tabpanel" aria-labelledby="EditApplication">
      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-3">
          <AddUserRolePopup />
          <CreateRole />
        </div>
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
      {loading ? (
        <Spinner style={{ margin: 50 }} label="fetching data..." />
      ) : (
        <>
          <DataGrid
            items={editUserRoleSearch}
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
              <DataGridBody<UserRole>>
                {({ item, rowId }) => (
                  <DataGridRow<UserRole> key={rowId}>
                    {({ renderCell }) => (
                      <DataGridCell>{renderCell(item)}</DataGridCell>
                    )}
                  </DataGridRow>
                )}
              </DataGridBody>
            </div>
          </DataGrid>
          <div>
            {userRoleData.length <= 0 && (
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
        </>
      )}
    </div>
  );
};

export default React.memo(EditUserRole);
