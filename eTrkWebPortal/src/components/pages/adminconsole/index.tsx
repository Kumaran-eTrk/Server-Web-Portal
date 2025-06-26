import { useContext } from "react";
import { AuthContext } from "../../contexts/authguard-context/Index";

import HolidayWidgetTab from "../../modules/adminconsole/components/holidaywidget/HolidayWidgets";
import ProjectUpdateWidget from "../../modules/adminconsole/components/projectwidget/ProjectUpdateWidget";

import UserDataWidgetTab from "../../modules/adminconsole/components/usermanagementwidget/UserDatasWidgetTab";
import ApplicationTab from "../../modules/adminconsole/components/applications/ApplicationWidgetTab";
import RolesUpdateWidgetTab from "../../modules/adminconsole/components/userroleupdatewidget/RolesUpdateWidget";

const Adminconsole = () => {
  const authContext = useContext(AuthContext);

  // Ensure authContext is defined
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { admin } = authContext;

  return (
    admin == "true" && (
      <div className="flex flex-col xl:flex-col w-full ">
        <div className="flex flex-col xl:flex-row gap-4 mr-4">
          <div className="flex-1 xl:w-1/2">
            <ApplicationTab />
          </div>
        </div>
        <div className="flex flex-col xl:flex-row gap-4 mr-4">
          <div className="flex-1 xl:w-1/2">
            <HolidayWidgetTab />
          </div>
        </div>
        <div className="flex flex-col xl:flex-row gap-4 mr-4">
          <div className="flex-1 xl:w-1/2">
            <UserDataWidgetTab />
          </div>
        </div>
        <div className="flex flex-col xl:flex-row gap-4 mr-4">
          <div className="flex-1 xl:w-1/2">
            <ProjectUpdateWidget />
          </div>
        </div>
        <div className="flex flex-col xl:flex-row gap-4 mr-4">
          <div className="flex-1 xl:w-1/2">
            <RolesUpdateWidgetTab />
          </div>
        </div>
      </div>
    )
  );
};

export default Adminconsole;
