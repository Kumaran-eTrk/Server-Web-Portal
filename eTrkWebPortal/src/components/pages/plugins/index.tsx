/* eslint-disable @typescript-eslint/no-unused-vars */

import { useContext } from "react";
import { AuthContext } from "../../contexts/authguard-context/Index";
import BrowserExtensionTab from "../../modules/plugins/components/extensiondetails/BrowserExtensionTab";
import SoftwareInstallationTab from "../../modules/plugins/components/softwaredetails/SoftwareInstallationTab";

const PluginInfo = () => {
  const authContext = useContext(AuthContext);

  // Ensure authContext is defined
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { admin, sysadmin } = authContext;

  const hasAccess = admin == "true" || sysadmin == "true";
  // If the user has access, render the components; otherwise, show a message
  return (
    hasAccess && (
      <div className="flex flex-col xl:flex-col w-full">
        <div className="flex flex-col xl:flex-row gap-4 mr-4">
          <div className="flex-1 xl:w-1/2">
            <BrowserExtensionTab />
          </div>
        </div>
        <div className="flex flex-col xl:flex-row gap-4 mr-4">
          <div className="flex-1 xl:w-1/2">
            <SoftwareInstallationTab />
          </div>
        </div>
      </div>
    )
  );
};

export default PluginInfo;
