import React from "react";

import EditUserRole from "./userrolewidget/edituserrole/EditUserRole";
import ToolTip from "../../../../shared/tooltip";
import { HelpIcon } from "../../../../shared/icons";


const RolesUpdateWidgetTab = () => {
  return (
    <div className="mt-8 flex flex-wrap space-x-0 space-y-2 md:space-x-4 md:space-y-0">
      <div className="flex-1 bg-white p-5 shadow rounded-lg w-full md:w-1/2">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start justify-between">
            <h2 className="relative flex gap-2 items-center text-gray-500 text-lg font-semibold pb-1">
              Roles
              <ToolTip
                text={
                  <React.Fragment>
                    <ul className="list-disc pl-5 mt-2">
                      <li className="mt-2">
                        Assign roles (admin, manager, system administrator) to
                        users based on their email.
                      </li>
                      <li className="mt-2">
                        {" "}
                        A user can have one or two roles.
                      </li>
                    </ul>
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

        <div className="widget-body">
          <div className="">
            <div className="divider"></div>
            <EditUserRole />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesUpdateWidgetTab;
