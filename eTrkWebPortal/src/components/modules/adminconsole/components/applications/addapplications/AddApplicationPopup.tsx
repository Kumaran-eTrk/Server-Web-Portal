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
  Tooltip,
  Label,
} from "@fluentui/react-components";
import api from "../../../../../interceptors";

import { IStackTokens, Stack, Toggle } from "@fluentui/react";
import { ProjectComboBox } from "../projectcombobox/ProjectCombobox";
import { ApplicationComboBox } from "../ApplicationCombobox/ApplicationCombobox";
import { useUserDataRangeContext } from "../../../../../contexts/user-data-context";
import { toast } from "react-toastify";

const stackTokens: IStackTokens = { childrenGap: 10 };

export const AddApplicationPopup = () => {

  const [productiveStatus, setProductiveStatus] = React.useState(false);
  const {selectedProjectIds,  selectedApplicationIds}:any= useUserDataRangeContext();
  
  const handleToggleChange = (_event: React.MouseEvent<HTMLElement>, checked?: boolean) => {
    if (checked !== undefined) {
      setProductiveStatus(checked);
   
    }
  };

  const togglestyles ={
    text:{
      color:'#6b7280'
    }
  }

  const handleSaveChange = async () => {

    try {
      const dataToPost ={
        projectId:selectedProjectIds ,
        applicationIds:selectedApplicationIds,
        productive: productiveStatus
      }
          
      const response = await api.post(`/adminscreen/createprojectapplication`,dataToPost);
      toast.success('Applications added successfully ', { autoClose: 2000 }); 
     
    } catch (error:any) {
      const errorMessage = error.response?.data|| "Application already exists";

      // Display the error message in the toast notification
      toast.error(`Error: ${errorMessage}`, { autoClose: 2000 });
    }
  };

  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>
      <Tooltip content={"Add Application"} relationship={"label"}>
      <div className="text-violet-900">
            <button
              className="px-2 py-1 border border-violet-200 rounded-sm"
             
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>

            </button>
          </div>
      </Tooltip>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Add Application</DialogTitle>
          <DialogContent>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '20px',gap:'10px' }}>
                <div>
                <Label required>Projects</Label>
                <br></br>
                <br></br>
                <ProjectComboBox/>
                <br></br>
                </div>
                <div>
                <Label required>Applications</Label>
                <br></br>
                <br></br>
                <ApplicationComboBox/>
                <br></br>
                </div>
                <div>
                <Label required>Productive/Unproductive</Label>
               
                <Stack tokens={stackTokens} >
                <div className='text-170' >
                <Toggle
                      onText="Productive"
                      offText="Unproductive"
                      styles={togglestyles}
                      onChange={(_ev, checked):any => handleToggleChange(_ev, checked)}
                    />
                </div>
              </Stack>
                </div>

          </div>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Close</Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
            <Button onClick={handleSaveChange} style={{  backgroundColor: '#26C0BB', color:'white'}}>Add</Button>
            </DialogTrigger>
         </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};