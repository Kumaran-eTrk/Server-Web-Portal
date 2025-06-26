import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  Button,
  Tooltip,
  Input,
  TableCellLayout,
  createTableColumn,
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridHeaderCell,
  DataGridBody,
  DataGridCell,
  Spinner,
  TableColumnDefinition,
} from "@fluentui/react-components";
import { EditRegular, Save16Regular } from "@fluentui/react-icons";

import { CreateRolePopup } from "./CreateRole";
import { DeleteUserRole } from "./deletepopup";
import api from "../../../../../../interceptors";

import { useUserDataRangeContext } from "../../../../../../contexts/user-data-context";

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
export const CreateRole = () => {
  const { roleOptions, setRoleOptions }: any = useUserDataRangeContext();
  const [changeButton, setChangeButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [Id, setId] = useState("");
  const [nameInput, setNameInput] = React.useState<string>("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(event.target.value);
  };

  const handleSaveChange = async () => {
    try {
      if (!nameInput) {
        return;
      }

      const dataToPost = {
        rolename: nameInput,
        description: "",
      };
      const response = await api.put(`/adminscreen/roles/${Id}`, dataToPost);

      if (response.status === 200) {
        setChangeButton(false);
        setNameInput("");
        const response = await api.get("/adminscreen/roles");
        const data = response.data;
        const sortedData = data.sort((a: any, b: any) => {
          const userNameA = a.roleName.toLowerCase();
          const userNameB = b.roleName.toLowerCase();
          return userNameA.localeCompare(userNameB);
        });
        setRoleOptions(sortedData);
      }
    } catch (error) {
      console.error("Error in posting data:", error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await api.get("/adminscreen/roles");
      const data = response.data;
      const sortedData = data.sort((a: any, b: any) => {
        const userNameA = a.roleName.toLowerCase();
        const userNameB = b.roleName.toLowerCase();
        return userNameA.localeCompare(userNameB);
      });
      setRoleOptions(sortedData);
    } catch (error) {
      console.error("Error posting data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: TableColumnDefinition<Role>[] = [
    createTableColumn<Role>({
      columnId: "Role name",
      renderHeaderCell: () => {
        return "Role name";
      },
      renderCell: (item: any) => {
        return (
          <>
            {changeButton && Id === item.roleId ? (
              <>
                <Input
                  value={nameInput}
                  onChange={handleInputChange}
                  placeholder={item.roleName}
                  required
                />
              </>
            ) : (
              <TableCellLayout style={{ wordBreak: "break-all" }}>
                {item.roleName}
              </TableCellLayout>
            )}
          </>
        );
      },
    }),

    createTableColumn<Role>({
      columnId: "Edit",
      renderHeaderCell: () => {
        return "";
      },
      renderCell: (item: any) => {
        return (
          <TableCellLayout style={{ wordBreak: "break-all" }}>
            {changeButton ? (
              <Button
                icon={<Save16Regular />}
                onClick={() => {
                  handleSaveChange();
                }}
              >
                {" "}
                Save
              </Button>
            ) : (
              <>
                <Button
                  icon={<EditRegular />}
                  onClick={() => {
                    setChangeButton(true);
                    setId(item.roleId);
                  }}
                >
                  {" "}
                  Edit
                </Button>
                <DeleteUserRole Id={item.roleId} />
              </>
            )}
          </TableCellLayout>
        );
      },
    }),
  ];

  return (
    <>
      <div className="create-role-container">
        <Dialog modalType="non-modal">
          <DialogTrigger disableButtonEnhancement>
            <Tooltip content={"Create Role"} relationship={"label"}>
              <button className="p-2 border  rounded-md">Create role</button>
            </Tooltip>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Add Role</DialogTitle>
              <DialogContent>
                <div>
                  <CreateRolePopup />
                  <DataGrid items={roleOptions} columns={columns}>
                    <DataGridHeader>
                      <DataGridRow style={{ backgroundColor: "#26C0BB" }}>
                        {({ renderHeaderCell }: any) => (
                          <DataGridHeaderCell
                            style={{
                              backgroundColor: "#26C0BB",
                              color: "white",
                            }}
                          >
                            {renderHeaderCell()}
                          </DataGridHeaderCell>
                        )}
                      </DataGridRow>
                    </DataGridHeader>
                    <div className="table-container">
                      {loading ? (
                        <Spinner
                          style={{ margin: 50 }}
                          label="fetching data..."
                        />
                      ) : (
                        <>
                          <DataGridBody<Role>>
                            {({ item, rowId }: any) => (
                              <DataGridRow<Role> key={rowId}>
                                {({ renderCell }) => (
                                  <DataGridCell>
                                    {renderCell(item)}
                                  </DataGridCell>
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
      </div>
    </>
  );
};
