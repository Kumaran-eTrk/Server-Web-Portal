import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  Button,
  Tooltip,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import SoftwareVersionHistory from "./SoftwareVersionHistory";


export const SoftwareEditHistoryTab = ({softwareId}:{softwareId:any}) => {

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
            <SoftwareVersionHistory softwareId={softwareId}/>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
