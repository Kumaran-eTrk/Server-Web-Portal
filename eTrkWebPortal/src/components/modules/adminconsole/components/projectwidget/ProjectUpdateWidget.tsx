
import React from "react";
import { useRangeContext } from "../../../../contexts/range-context";
import { HelpIcon } from "../../../../shared/icons";
import ToolTip from "../../../../shared/tooltip";

import AddProject from "./addproject/AddProject";
import EditProject from "./editproject/EditProject";

const ProjectUpdateWidgetTab = () => {
   // State to control the visibility of the popup
  const {projectPopup}: any = useRangeContext();
  


  return (
    <div className="mt-8 flex flex-wrap space-x-0 space-y-2 md:space-x-4 md:space-y-0">
      <div className="flex-1 bg-white p-5 shadow rounded-lg w-full md:w-1/2">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start justify-between">
          <h2 className="relative flex gap-2 items-center text-gray-500 text-lg font-semibold pb-1">
              Project
              <ToolTip
                text={
                  <React.Fragment>
                    Create the projects which is used to map the users on the
                    projects.
                  </React.Fragment>
                }
              >
                <HelpIcon />
              </ToolTip>
            </h2>
          </div>
          
        </div>
        <div className="my-1"></div>
        <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div>
  
      <EditProject/>
        
        {projectPopup && (
          <div className="popup">
            <div className="popup-inner">
             
              <AddProject />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectUpdateWidgetTab;
