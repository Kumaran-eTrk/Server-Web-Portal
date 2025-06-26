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
  Input,
  Label,
} from "@fluentui/react-components";
import {AddRegular} from "@fluentui/react-icons";
import { useUserDataRangeContext } from "../../../../../../contexts/user-data-context";
import api from "../../../../../../interceptors";





export const CreateRolePopup = () => {
  const {nameInput, setNameInput,setRoleOptions}:any=useUserDataRangeContext();
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(event.target.value);
  };


  const handleSaveChange = async () => {

    try {
        if (!nameInput ) {
            return;
          }
      
      const dataToPost ={
        rolename:nameInput,
        description:''
      }
      const response = await api.post(`/adminscreen/roles`,dataToPost);
      console.log('Data',response)
      if(response.status===200){
        setNameInput('')
        const response = await api.get('/adminscreen/roles');
        const data = response.data;
        const sortedData = data.sort((a:any, b:any) => {
            const userNameA = a.roleName.toLowerCase();
            const userNameB = b.roleName.toLowerCase();
            return userNameA.localeCompare(userNameB);
          });
        setRoleOptions(sortedData);
      }
    } catch (error) {
      console.error("Error in posting data:", error);
    }
  };

  return (
    <Dialog modalType="non-modal">
      <DialogTrigger disableButtonEnhancement>
      <Tooltip content={"Add Role"} relationship={"label"}>
          <Button size="medium" style={{marginBottom:'5px'}} icon={<AddRegular/>}></Button>
      </Tooltip>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Add Roles</DialogTitle>
          <DialogContent>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '20px' }}>
                <div>
                <Label required>Role Name</Label>
                <br></br>
                <Input 
                value={nameInput}
                onChange={handleInputChange}
                placeholder="Role Name" 
                required/>
                <br></br>
            </div>

          </div>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Close</Button>
            </DialogTrigger>
            <Button onClick={handleSaveChange} style={{  backgroundColor: '#26C0BB', color:'white'}}>Save</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};