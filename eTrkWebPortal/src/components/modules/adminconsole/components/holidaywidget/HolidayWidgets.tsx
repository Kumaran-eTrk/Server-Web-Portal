import AddHoliday from "./holidaypopup/AddHoliday"; // Import your AddHoliday component here
import { useRangeContext } from "../../../../contexts/range-context";

import HolidayEditTable from "./holidaypopup/HolidayEditTable";
import ToolTip from "../../../../shared/tooltip";
import React from "react";
import { HelpIcon } from "../../../../shared/icons";

const HolidayWidgetTab = () => {
  const { holidayPopup }: any = useRangeContext();

  return (
    <div className="mt-8 flex flex-wrap space-x-0 space-y-2 md:space-x-4 md:space-y-0">
      <div className="flex-1 bg-white p-5 shadow rounded-lg w-full md:w-1/2">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start justify-between">
            <h2 className="relative flex gap-2 items-center text-gray-500 text-lg font-semibold pb-1">
              Holiday
              <ToolTip
                text={
                  <React.Fragment>
                    Add holidays based on branch and location.
                    <br />
                    <br />
                    If multiple branches are in one location, separate them with
                    a comma (e.g., Chennai, Bangalore).
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

        <HolidayEditTable />

        {holidayPopup && (
          <div className="popup">
            <div className="popup-inner">
              <AddHoliday />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayWidgetTab;
