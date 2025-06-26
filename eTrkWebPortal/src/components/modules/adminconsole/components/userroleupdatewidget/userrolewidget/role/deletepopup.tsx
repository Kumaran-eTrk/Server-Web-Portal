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
import api from "../../../../../../interceptors";
import { useUserDataRangeContext } from "../../../../../../contexts/user-data-context";
import { toast } from "react-toastify";
import { DeleteRegular } from "@fluentui/react-icons";

export const DeleteUserRole = ({ Id }: { Id: any }) => {
  const { setRoleOptions }: any = useUserDataRangeContext();

  const handleChange = async () => {
    try {
      const response = await api.delete(`/adminscreen/roles/${Id}`);

      if (response.status === 200) {
        toast.success("Data deleted successfully");
        const response = await api.get("/adminscreen/roles");
        const data = response.data;
        const sortedData = data.sort((a: any, b: any) => {
          const dateA = new Date(a.modifiedDatetime);
          const dateB = new Date(b.modifiedDatetime);
          return dateB.getTime() - dateA.getTime();
        });
        setRoleOptions(sortedData);
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
            <Button appearance="primary" onClick={handleChange}>
              Delete
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
