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
  makeStyles,
  shorthands,
  useId,
  useToastController,
} from "@fluentui/react-components";
import { Dismiss16Regular } from "@fluentui/react-icons";
import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../../../../../interceptors";

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

export const SoftwareRejectPopup = ({
  setUnknownSoftware,
  softwareName,
  softwareVersion,
  softwareId,
}: {
  setUnknownSoftware?: any;
  softwareName: string;
  softwareVersion: string;
  softwareId: string;
}) => {
  const [close, setClose] = useState(true);
  const toasterId = useId("toaster");
  const [remarks, setRemarks] = useState<string>();
  const [approve, setApprove] = React.useState<AcceptanceStatus>(
    AcceptanceStatus.rejected
  );
  const styles1 = useStyle();
  const { dispatchToast } = useToastController(toasterId);

  const handleApproveChange = async () => {
    try {
      const dataToPost = {
        status: approve,
        remarks: remarks,
      };
      const responses = await api.put(
        `/softwares/updatesoftware/${softwareId}`,
        dataToPost
      );

      if (responses.status === 200) {
        toast.success("Changes Updated successfully ", { autoClose: 1000 });

        setClose(false);
      }
      const response = await api.get(`/softwares/unknownstatus`);
      const data = response.data;
      const sortedData = data.sort((a: any, b: any) => {
        const userNameA = a.name.toLowerCase();
        const userNameB = b.name.toLowerCase();
        return userNameA.localeCompare(userNameB);
      });

      setUnknownSoftware(sortedData);
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
          icon={<Dismiss16Regular />}
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
            Are you sure want to reject this software?
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
                Reject
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
