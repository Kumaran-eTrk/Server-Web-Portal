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
  Toast,
  ToastTitle,
  ToastTrigger,
  Toaster,
  Tooltip,
  makeStyles,
  shorthands,
  useId,
  useToastController,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import * as React from "react";
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

export const AddNewSoftware = () => {
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
                <Dismiss24Regular />
              </Link>
            </ToastTrigger>
          }
        >
          Saved Successfully: {AcceptanceStatus[status]}
        </ToastTitle>
      </Toast>,
      { intent: "success" }
    );

  const [software, setSoftware] = React.useState("");
  const [version, setVersion] = React.useState("");
  const [approve, setApprove] = React.useState<AcceptanceStatus>(
    AcceptanceStatus.unknown
  );
  const handleSaveChange = async () => {
    try {
      const dataToPost = {
        name: software,
        modifiedBy: "string",
        version: version,
        status: approve,
      };
      const responses = await api.post(`/softwares/createsoftware`, dataToPost);

      if (responses.status === 200) {
        notify(approve);
      }
    } catch (error) {
      console.error("Error in browser extension update:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="primary"
          style={{ background: "#26C0BB" }}
          size="medium"
        >
          Add new Software
        </Button>
      </DialogTrigger>
      <DialogSurface aria-describedby={undefined}>
        <DialogBody>
          <DialogTitle>Dialog title</DialogTitle>
          <DialogContent className={styles1.content}>
            <Label required htmlFor={"software-input"}>
              Software Name
            </Label>
            <Input
              required
              type="text"
              id={"software-input"}
              onChange={(e) => {
                setSoftware(e.target.value);
              }}
              value={software}
            />
            <Label required htmlFor={"version-input"}>
              Version
            </Label>
            <Input
              required
              type="text"
              id={"version-input"}
              onChange={(e) => {
                setVersion(e.target.value);
              }}
              value={version}
            />
            <Label required htmlFor={"approve/reject-input"}>
              Approve or Reject Software
            </Label>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                gap: "4px",
              }}
            >
              <Tooltip content="Unknown" relationship="label">
                <Button
                  appearance="primary"
                  size="small"
                  onClick={() => {
                    setApprove(AcceptanceStatus.unknown);
                  }}
                >
                  Unknown
                </Button>
              </Tooltip>
              <Tooltip content="Accept" relationship="label">
                <Button
                  appearance="primary"
                  size="small"
                  onClick={() => {
                    setApprove(AcceptanceStatus.accepted);
                  }}
                >
                  Accept
                </Button>
              </Tooltip>
              <Tooltip content="Reject" relationship="label">
                <Button
                  appearance="primary"
                  size="small"
                  onClick={() => {
                    setApprove(AcceptanceStatus.rejected);
                  }}
                >
                  Reject
                </Button>
              </Tooltip>
            </div>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Close</Button>
            </DialogTrigger>
            <Toaster toasterId={toasterId} />
            <Button
              type="submit"
              appearance="primary"
              onClick={() => {
                handleSaveChange();
              }}
            >
              Save
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
