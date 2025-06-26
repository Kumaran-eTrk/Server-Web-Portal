
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Tooltip,
 
  Label,
} from "@fluentui/react-components";
import { EditRegular } from "@fluentui/react-icons";

import { toast } from "react-toastify";
import { RolePicker } from "../userrolepicker/RolePicker";
import React from "react";
import api from "../../../../../../interceptors";
import { useUserDataRangeContext } from "../../../../../../contexts/user-data-context";


export const EditUserRolePopup = ({ id }: { id: any }) => {
  const {
    setUserRoleData,
    userRoleData,
    roleOptions,
    setRoleOptions,
  }: any = useUserDataRangeContext();
  const[enable,setEnable] = React.useState(false);

  React.useEffect(()=> {
    if( roleOptions.length > 0 ){
      setEnable(true)
    }
  },[,roleOptions])
  
  
  const currentEditUserRoleData = userRoleData.find(
    (userRoleData: any) => userRoleData.id === id
  );

  const handleSaveChange = async () => {
    try {
      const dataToPost = {
        roleIds: roleOptions.length > 0 ? roleOptions : [0],
      };

      const response = await api.put(
        `/adminscreen/userroles/${currentEditUserRoleData?.useremail}`,
        dataToPost
      );

      if (response.status === 200) {
        toast.success("User role updated successfully!");
        setRoleOptions([]);
        const updatedUserRoleData = await fetchUpdatedUserRoleData();
        setUserRoleData(updatedUserRoleData);
      
      }
      
    } catch (error: any) {
      if (error.response.status === 409) {
        toast.error("User role already exists!");
      }
      if (error.response.status === 400) {
        toast.error("field is required");
      }
      console.error("Error in updating user role:", error);
    }
  };

 
  

  const fetchUpdatedUserRoleData = async () => {
    try {
      const response = await api.get("/adminscreen/userroles");
      const data = response.data;
      const sortedData = data.sort((a: any, b: any) => {
        const dateA = new Date(a.modifiedDatetime);
        const dateB = new Date(b.modifiedDatetime);
        return dateB.getTime() - dateA.getTime();
      });
      return sortedData;
    } catch (error) {
      console.error("Error fetching updated user role data:", error);
      return [];
    }
  };

  return (
    <>

      <Dialog >
      <DialogTrigger disableButtonEnhancement>
        <Tooltip content={"Edit UserRole"} relationship={"label"}>
          <Button size="medium" style={{ marginBottom: "5px" }}  icon={<EditRegular />} />
        </Tooltip>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Edit UserName</DialogTitle>
          <DialogContent>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "20px" }}>
              <div>
                <Label>Role</Label>
                <RolePicker />
                <Label style={{ color: "red" }}>Current Role: {currentEditUserRoleData?.rolename}</Label>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Close</Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
            <Button  disabled={!enable} onClick={handleSaveChange} style={{ backgroundColor: "#444791", color: "white" }}>
              Save
            </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>

  </>
  );
};
