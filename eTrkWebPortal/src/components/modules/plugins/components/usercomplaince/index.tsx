/* eslint-disable @typescript-eslint/no-unused-vars */

import { useContext } from "react";
import SoftwareUserCompliance from "./SoftwareUserCompliance";
import UserCompliance from "./UserCompliance";
import { AuthContext } from "../../../../contexts/authguard-context/Index";






const UserCompliances = () => {
  


  const authContext = useContext(AuthContext);

  // Ensure authContext is defined
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { admin,sysadmin } = authContext;

 
  const hasAccess = admin =='true' || sysadmin == 'true';

  // If the user has access, render the components; otherwise, show a message
  return hasAccess && (
    
    <div className="flex flex-col xl:flex-col w-full">
      <div className="flex flex-col xl:flex-row gap-4 mr-4">
        <div className="flex-1 xl:w-1/2">
          <UserCompliance />
        </div>
      </div>
      <div className="flex flex-col xl:flex-row gap-4 mr-4">
      <div className="flex-1 xl:w-1/2">
        <SoftwareUserCompliance />
        </div></div>

      
     
      
    </div> 
  )
};

export default UserCompliances;