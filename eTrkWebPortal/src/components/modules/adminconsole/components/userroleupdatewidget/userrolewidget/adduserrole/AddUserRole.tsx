import {
  Button,
  Combobox,
  ComboboxProps,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Label,
  Option,
  Persona,
  Tooltip,
} from "@fluentui/react-components";
import * as React from "react";

import { useState } from "react";
import { toast } from "react-toastify";

import { RolePicker } from "../userrolepicker/RolePicker";
import useFetchUsers from "../../../../../../shared/dropdown/EmployeePicker";
import { useUserDataRangeContext } from "../../../../../../contexts/user-data-context";
import api from "../../../../../../interceptors";


export const AddUserRolePopup = () => {
  const { roleOptions, setUserRoleData }: any = useUserDataRangeContext();
  const { users } = useFetchUsers();
  const [selectEmployee, setSelectEmployee] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);

  const [enable, setEnable] = React.useState(false);

  React.useEffect(() => {
    if (roleOptions.length > 0) {
      setEnable(true);
    }
  }, [roleOptions]);

  const handleSaveChange = async () => {
    try {
      const dataToPost = {
        email: employee[0],
        roleIds: roleOptions,
      };

      const response = await api.post(`/adminscreen/userroles`, dataToPost);
      console.log("Data", response);
      if (response.status === 200) {
        toast.success("UserRole added successfully");

        const response = await api.get("/adminscreen/userroles");
        const data = response.data;
        const sortedData = data.sort((a: any, b: any) => {
          const dateA = new Date(a.modifiedDatetime);
          const dateB = new Date(b.modifiedDatetime);
          return dateB.getTime() - dateA.getTime();
        });
        setUserRoleData(sortedData);
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(`Failed to add user role  : ${error.response.data.error}`, {
          autoClose: 2000,
        });
      }
    }
  };

  const onSelect: ComboboxProps["onOptionSelect"] = (_event, data) => {
    if (data.selectedOptions) {
      setSelectEmployee(data.selectedOptions);

      const selectedIds = users
        .filter((user) => data.selectedOptions.includes(user.email))
        .map((user) => user.email);
      setEmployee(selectedIds);
    } else {
      setEmployee([]);
    }
  };

  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>
        <Tooltip content={"Add UserRole"} relationship={"label"}>
          <div className="text-violet-900">
            <button
              className="px-2 py-1 border border-violet-200 rounded-sm"
              // Attach onClick event to open the popup
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
          </div>
        </Tooltip>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Add UserRole</DialogTitle>
          <DialogContent>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                columnGap: "20px",
              }}
            >
              <div>
                <Label required>E-mail</Label>
                <br></br>

                {/* <EmployeeSelect onEmployeeChange={selectedEmployee} /> */}
                <Combobox
                  placeholder="Select an employee"
                  selectedOptions={selectEmployee}
                  onOptionSelect={onSelect}
                >
                  {users.map((user, index) => (
                    <Option key={index.toString()} text={user.email}>
                      <Persona
                        avatar={{ color: "colorful", "aria-hidden": true }}
                        name={user.displayName}
                        secondaryText={user.jobTitle}
                      />
                    </Option>
                  ))}
                </Combobox>
              </div>
              <div>
                <Label required>Role</Label>
                <RolePicker />
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Close</Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
              <Button
                disabled={!enable}
                onClick={handleSaveChange}
                style={{ backgroundColor: "#444791", color: "white" }}
              >
                Add
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
