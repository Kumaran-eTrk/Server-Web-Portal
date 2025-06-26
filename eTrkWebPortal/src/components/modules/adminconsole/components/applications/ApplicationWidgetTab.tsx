import * as React from "react";

import "../applications/styles/Popover.css";

import EditApplication from "./editapplications/EditApplication";
import { HelpIcon } from "../../../../shared/icons";
import ToolTip from "../../../../shared/tooltip";

interface IListWidgetProps {}

export type Item = {
  username: string;
  name: string;
  browser: string;
  status: string;
  buttonfield: JSX.Element;
};

const ApplicationTab: React.FC<IListWidgetProps> = () => {
  const currentDate = new Date();

  return (
    <div className="mt-8 flex flex-wrap space-x-0 space-y-2 md:space-x-4 md:space-y-0 ">
      <div className="flex-1 bg-white p-5 shadow rounded-lg w-full md:w-1/2 ">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start justify-between ">
            <h2 className="flex text-gray-500 text-lg font-semibold pb-1 gap-2">
              Application
              <ToolTip
                text={
                  <React.Fragment>
                    <b> Create Application : </b>
                    <br />
                    <ul className="list-disc pl-5 mt-2">
                      <li className="mt-2">
                        Click the new application button on the Application
                        Widget.
                      </li>
                      <li className="mt-2">
                        Provide an alternative name for the application and save
                        it.
                      </li>
                      <li className="mt-2">
                        Add only one application at a time.
                      </li>
                    </ul>
                    <br />
                    <b> Map the application to project : </b>
                    <br />
                    <ul className="list-disc pl-5 mt-2">
                      <li className="mt-2">
                        Click the plus icon on the Application Widget to map
                        applications to projects.
                      </li>
                      <li className="mt-2">
                        Use the project dropdown to select multiple projects.
                      </li>
                      <li className="mt-2">
                        Use the applications dropdown to choose applications to
                        map to the selected projects.
                      </li>
                    </ul>
                    <br />
                    <b> Application Mapping Rules : </b>
                    <br />
                    <ul className="list-disc pl-5 mt-2">
                      <li className="mt-2">
                        <b>i.e :</b> If Google Chrome is mapped as productive in
                        a one project,
                        <br />
                        it will be automatically set as unproductive in other
                        projects.
                      </li>
                      <li className="mt-2">
                        <b>Note :</b> Always map new applications to their
                        respective projects
                        <br /> unmapped applications won't record data.
                      </li>
                    </ul>
                  </React.Fragment>
                }
              >
                <HelpIcon />
              </ToolTip>
            </h2>
            <div className="flex text-sm">
              {currentDate.toISOString().split("T")[0]}
              <span className="px-1">to</span>
              {currentDate.toISOString().split("T")[0]}
            </div>
          </div>
          <div></div>
        </div>
        <div className="my-1"></div>
        <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div>

      

        <div className="header-95 mt-4"></div>
        <div className="widget-body">
          <div className="">
            <div className="divider"></div>
            <EditApplication />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "4px",
                marginRight: "8px",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationTab;
