import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  Tooltip,

} from "@fluentui/react-components";

import { GetApplication } from "./GetApplication";



export const Application = () => {
  return (
    <>
      <Dialog modalType="non-modal">
        <DialogTrigger disableButtonEnhancement>
          <Tooltip content="Add Application" relationship="label">
          <button
              className="p-2 border  rounded-md"
              // Attach onClick event to open the popup
            >Create New Application</button>
          </Tooltip>
        </DialogTrigger>

        <DialogSurface>
          <DialogBody>
            <DialogTitle>New Applications</DialogTitle>
            <DialogContent>
              <GetApplication />
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};
