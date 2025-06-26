import * as React from "react";

import { Text } from "@fluentui/react-components";
import { DataPie24Regular } from "@fluentui/react-icons";
import EditUserRole from "./edituserrole/EditUserRole";

interface IListWidgetProps {}

const UserRoleTab: React.FC<IListWidgetProps> = () => {
  const currentDate = new Date();

  return (
    <div className="root-94">
      <div className="header-95">
        <div>
          <div>
            <DataPie24Regular />
            <Text weight="medium" size={400}>
              User Role
            </Text>
          </div>
          <div></div>
        </div>
        <Text size={200} style={{ marginLeft: "20px" }}>
          {currentDate.toISOString().split("T")[0]}
          <span style={{ padding: "4px" }}>to</span>
          {currentDate.toISOString().split("T")[0]}
        </Text>
      </div>
      <div className="widget-body">
        <div className="">
          <div className="divider"></div>
          <EditUserRole />
        </div>
      </div>
    </div>
  );
};

export default UserRoleTab;
