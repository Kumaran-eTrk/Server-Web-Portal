import * as React from "react";
import AddUserdata from "./adduserdata/AddUserdata";
import EditUserDatas from "./edituserdata/EditUserDatas";
import { useRangeContext } from "../../../../contexts/range-context";
import ToolTip from "../../../../shared/tooltip";
import { HelpIcon } from "../../../../shared/icons";

interface IListWidgetProps {}

export type Item = {
  username: string;
  name: string;
  browser: string;
  status: string;
  buttonfield: JSX.Element;
};

const UserDataWidgetTab: React.FC<IListWidgetProps> = () => {
  const { userdataPopup }: any = useRangeContext();

  return (
    <div className="mt-8 flex flex-wrap space-x-0 space-y-2 md:space-x-4 md:space-y-0 ">
      <div className="flex-1 bg-white p-5 shadow rounded-lg w-full md:w-1/2 ">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start justify-between ">
            <h2 className="relative flex gap-2 items-center text-gray-500 text-lg font-semibold pb-1">
              User Data Management
              <ToolTip
                text={
                  <React.Fragment>
                    <ul className="list-disc pl-5 mt-2">
                      <li className="mt-2">
                        Add the users who have installed the monitor user
                        application
                      </li>
                      <li className="mt-2">
                        Username and Domain name should be same as in your
                        database in usermetadata table.
                      </li>
                    </ul>
                  </React.Fragment>
                }
              >
                <HelpIcon />
              </ToolTip>
            </h2>
          </div>
          <div></div>
        </div>
        <div className="my-1"></div>
        <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div>

        <div className="root-94 mt-4">
          <EditUserDatas />
          {userdataPopup && (
            <div className="popup">
              <div className="popup-inner">
                <AddUserdata />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDataWidgetTab;
