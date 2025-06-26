import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Link,
  makeStyles,
  shorthands,
  Toast,
  ToastTitle,
  ToastTrigger,
  useId,
  useToastController,
} from "@fluentui/react-components";
import { Checkmark16Regular, Dismiss16Regular } from "@fluentui/react-icons";
import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../../../../../interceptors";

const useStyle = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("20px"),
    // maxWidth: '400px',
    "> div": {
      display: "flex",
      flexDirection: "column",
      ...shorthands.gap("2px"),
    },
  },
  content: {
    display: "flex",
    flexDirection: "column",
    rowGap: "10px",
  },
});

enum AcceptanceStatus {
  unknown = 0,
  accepted = 1,
  rejected = 2,
}

export const UpdateApprovePopup = ({
  setUpdateReject,
  extensionId,
}: {
  setUpdateReject: any;
  extensionId: string;
}) => {
  const [remarks, setRemarks] = useState<string>();
  const [approve, setApprove] = React.useState<AcceptanceStatus>(
    AcceptanceStatus.accepted
  );

  const toasterId = useId("toaster");
  const styles1 = useStyle();
  const { dispatchToast } = useToastController(toasterId);
  const notify = () =>
    dispatchToast(
      <Toast>
        <ToastTitle
          action={
            <ToastTrigger>
              <Link>
                <Dismiss16Regular />
              </Link>
            </ToastTrigger>
          }
        >
          Changes Updated Successfully
        </ToastTitle>
      </Toast>,
      { intent: "success" }
    );
  const handleApproveChange = async () => {
    try {
      const dataToPost = {
        status: approve,
        remarks: remarks,
      };
      const responses = await api.put(
        `/extensions/updateextension/${extensionId}`,
        dataToPost
      );

      if (responses.status === 200) {
        toast.success("Changes Updated successfully ", { autoClose: 2000 });
      }
      const response = await api.get("/extensions/rejectedstatus");
      const data = response.data;
      const sortedData = data.sort((a: any, b: any) => {
        const userNameA = a.name.toLowerCase();
        const userNameB = b.name.toLowerCase();
        return userNameA.localeCompare(userNameB);
      });

      setUpdateReject(sortedData);
    } catch (error) {
      console.error("Error in browser extension update:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>
        <Button size="small" icon={<Checkmark16Regular />}></Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle></DialogTitle>
          <DialogContent className={styles1.content}>
            <Label required htmlFor={"remarks-input"}>
              Remarks
            </Label>
            <Input
              required
              type="text"
              id={"remarks-input"}
              onChange={(e) => {
                setRemarks(e.target.value);
              }}
              value={remarks}
            />
            Are you sure want to move this extension from rejected to approve ?
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Cancel</Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
              <Button
                appearance="primary"
                onClick={() => {
                  handleApproveChange();
                }}
              >
                Approve
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
