import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  ToastTrigger,
  Label,
  Input,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";
import { useState } from "react";
import {
  useId,
  Link,
  useToastController,
  Toast,
  ToastTitle,
} from "@fluentui/react-components";
import { Dismiss16Regular, Checkmark16Regular } from "@fluentui/react-icons";
import api from "../../../../../interceptors";
import { toast } from "react-toastify";

enum AcceptanceStatus {
  unknown = 0,
  accepted = 1,
  rejected = 2,
}

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

export const ApproveConformationPopup = ({
  setBrowserExtension,
  extensionId,
  extensionName,
  extensionVersion,
}: {
  setBrowserExtension?: any;
  extensionId: string;
  extensionName: string;
  extensionVersion: string;
}) => {
  const [close, setClose] = useState(true);
  const [remarks, setRemarks] = useState<string>();
  const [approve, setApprove] = React.useState<AcceptanceStatus>(
    AcceptanceStatus.accepted
  );
  const styles1 = useStyle();
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  const notify = (status: AcceptanceStatus) =>
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
          Saved Successfully: {AcceptanceStatus[status]}
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
      console.log("data", responses);
      if (responses.status === 200) {
        toast.success("Changes Updated successfully ", { autoClose: 1000 });

        setClose(false);
      }
      const response = await api.get("/extensions/unknownstatus");
      const data = response.data;
      const sortedData = data.sort((a: any, b: any) => {
        const userNameA = a.name.toLowerCase();
        const userNameB = b.name.toLowerCase();
        return userNameA.localeCompare(userNameB);
      });

      setBrowserExtension(sortedData);
    } catch (error) {
      console.error("Error in browser extension update:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>
        <Button
          style={{ backgroundColor: "" }}
          size="small"
          icon={<Checkmark16Regular />}
        ></Button>
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
            Are you sure want to approve this extension?
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
