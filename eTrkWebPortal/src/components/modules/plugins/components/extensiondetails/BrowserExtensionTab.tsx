import type {
  SelectTabData,
  SelectTabEvent,
  TabValue,
} from "@fluentui/react-components";
import {
  makeStyles,
  shorthands,
  tokens
} from "@fluentui/react-components";
import {
  bundleIcon,
} from "@fluentui/react-icons";
import * as React from "react";

import { Tab, TabList } from "@fluentui/react-components";
import { CheckmarkCircleFilled, CheckmarkCircleRegular, DismissCircleFilled, DismissCircleRegular, QuestionCircleFilled, QuestionCircleRegular } from "@fluentui/react-icons";
import { HelpIcon } from "../../../../shared/icons";
import ToolTip from "../../../../shared/tooltip";
import { AddNewExtensionTab } from "./AddNewExtensionTab";
import ApprovedTab from "./AppprovedTab";
import RejectedTab from "./RejectedTab";
import UnknownTab from "./UnknownTab";

interface IListWidgetProps {
  
}

export type Item = {
  username: string;
  name: string;
  browser:string;
  status: string;
  buttonfield:JSX.Element;
};

const RejectIcon = bundleIcon(DismissCircleFilled, DismissCircleRegular);

const UnknownIcon = bundleIcon(QuestionCircleFilled, QuestionCircleRegular);

const ApproveIcon = bundleIcon(CheckmarkCircleFilled, CheckmarkCircleRegular);

const useStyles = makeStyles({
  root: {
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    ...shorthands.padding("50px", "20px"),
    rowGap: "20px",
  },
  panels: {
    ...shorthands.padding(0, "10px"),
    "& th": {
      textAlign: "left",
      ...shorthands.padding(0, "30px", 0, 0),
    },
  },
  propsTable: {
    "& td:first-child": {
      fontWeight: tokens.fontWeightSemibold,
    },
    "& td": {
      ...shorthands.padding(0, "30px", 0, 0),
    },
  },
});



const BrowserExtensionTab: React.FC<IListWidgetProps> = () => {
  const styles = useStyles();

  const [selectedValue, setSelectedValue] =
    React.useState<TabValue>("Unknown");
    

  const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    setSelectedValue(data.value);
  };
  

    return (
        <div className="mt-8 flex flex-wrap space-x-0 space-y-2 md:space-x-4 md:space-y-0 ">
      
        <div className="flex-1 bg-white p-5 h-full shadow rounded-lg w-full md:w-1/2 ">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start justify-between ">
          <h2 className="relative flex gap-2 items-center text-gray-500 text-lg font-semibold pb-1">
              Browser Extensions
              <ToolTip
                text={
                  <React.Fragment>
                    <b> Browser Extensions </b>
                    <br />

                    <ul className="list-disc pl-5">
                      <li className="mt-2">
                        You can see a list of browser extensions installed by
                        all users.
                      </li>
                      <li className="mt-2">
                        Administrators can approve or reject items based on
                        functionality and security.
                      </li>
                      <li className="mt-2">
                        If rejected, users receive an email every 3 hours until
                        the extension is uninstalled
                      </li>
                    </ul>
                  </React.Fragment>
                }
              >
                <HelpIcon />
              </ToolTip>
            </h2>
          </div>
          <div>
          <TabList selectedValue={selectedValue} onTabSelect={onTabSelect}>
                <Tab id="Unknown" icon={<UnknownIcon />} value="Unknown">
                Unknown
                </Tab>
                <Tab id="Approved" icon={<ApproveIcon />} value="Approved">
                Approved
                </Tab>
                <Tab id="Rejected" icon={<RejectIcon />} value="Rejected">
                Rejected
                </Tab>
            </TabList>
          </div>
          </div>
          <div className="my-1"></div> 
          
          <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div> 
         
          {/* <div className="flex flex-wrap justify-between mt-4 h-32 overflow-y-scroll overscroll-x-none "> */}
          <div className='widget-body mt-2'>
          <div className="">
            <div className='divider'></div>
            <div className={styles.panels}>
                {selectedValue === "Unknown" && <UnknownTab />}
                {selectedValue === "Approved" && <ApprovedTab />}
                {selectedValue === "Rejected" && <RejectedTab />}
            
          </div>
        </div>
         
          </div>
          <div className="flex justify-end">
          <AddNewExtensionTab/>
          </div>
        </div>      
    
      </div>
    );
};

export default BrowserExtensionTab;
