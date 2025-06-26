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
  import api from "../../../../../interceptors";
  import { useUserDataRangeContext } from "../../../../../contexts/user-data-context";
  import { toast } from "react-toastify";
  import {DeleteRegular} from "@fluentui/react-icons";
  
  export const DeleteApplication = ({Id}:{Id:any}) => {
  
      const {setGetNewApplicationData}:any=useUserDataRangeContext();
  
      const handleChange = async () => {
  
          try {
              const response = await api.delete(`/adminscreen/deleteapplication/${Id}`);
              console.log('Data',response)
              if(response.status===200){
                toast.success('Data deleted successfully');
                const response = await api.get('/adminscreen/getapplications');
                const data = response.data;
                  setGetNewApplicationData(data);
              }
          } catch (error) {
            console.error("Error in deleting data:", error);
            toast.error('Failed to delete');
          }
        };
    return (
      <Dialog>
        <DialogTrigger disableButtonEnhancement>
          <Button style={{marginLeft:'10px'}} icon={<DeleteRegular/>}></Button>
        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete UserData</DialogTitle>
            <DialogContent>
              Are you sure want to delete this Application?
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Close</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleChange}>Delete</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    );
  };