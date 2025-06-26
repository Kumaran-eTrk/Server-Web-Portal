import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Tooltip,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import VersionHistory from "./VersionHistory";


export const EditHistoryTab = ({extensionId}:{extensionId:any}) => {

  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>
      <Tooltip content="Edit History" relationship="label">
        <Button>Edit History</Button>
      </Tooltip>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
        <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  appearance="subtle"
                  aria-label="close"
                  icon={<Dismiss24Regular />}
                />
              </DialogTrigger>
            }
          >Edit History</DialogTitle>
          <DialogContent>
            <VersionHistory extensionId={extensionId}/>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
