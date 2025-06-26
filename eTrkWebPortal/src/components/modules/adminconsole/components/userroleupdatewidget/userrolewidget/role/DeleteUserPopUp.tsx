import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
} from "@fluentui/react-components";

import { toast } from "react-toastify";
import { DeleteRegular } from "@fluentui/react-icons";
import api from "../../../../../../interceptors";
import { useUserDataRangeContext } from "../../../../../../contexts/user-data-context";

export const DeleteRole = ({ Id }: { Id: any }) => {
  const { setUserRoleData }: any = useUserDataRangeContext();

  const handleChange = async () => {
    try {
      const response = await api.delete(`/adminscreen/userrole/${Id}`);

      if (response.status === 200) {
        toast.success("Data deleted successfully");
        const response = await api.get("/adminscreen/userroles");
        const data = response.data;
        const sortedData = data.sort((a: any, b: any) => {
          const dateA = new Date(a.modifiedDatetime);
          const dateB = new Date(b.modifiedDatetime);
          return dateB.getTime() - dateA.getTime();
        });
        setUserRoleData(sortedData);
      }
    } catch (error) {
      console.error("Error in deleting data:", error);
      toast.error("Failed to delete");
    }
  };
  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>
        <Button
          style={{ marginLeft: "10px" }}
          icon={<DeleteRegular />}
        ></Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Delete User Role</DialogTitle>
          <DialogContent>
            Are you sure want to delete this userRole?
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Close</Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="primary" onClick={handleChange}>
                Delete
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
