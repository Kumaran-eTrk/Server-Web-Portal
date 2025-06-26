/* eslint-disable @typescript-eslint/no-unused-vars */

import { useContext } from "react";

import { AuthContext } from "../../contexts/authguard-context/Index";
import { ClaimsProvider } from "../../contexts/range-context";
import NonLoggedUsers from "../../modules/teaminfo/components/NonLoggedUsers";
import WorkingPattern from "../../modules/teaminfo/components/WorkingPattern";
import { UserComparisonChart } from "../../modules/teaminfo/components/ComparisonGraph";
import UserRecording from "../../modules/teaminfo/components/UserRecording";
import AverageWorkHours from "../../modules/teaminfo/components/AverageWorkHours";

const Teaminfo = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { admin, manager } = authContext;

  const hasAccess = admin == "true" || manager == "true";

  return (
    hasAccess && (
      <ClaimsProvider>
        <div className="flex flex-col xl:flex-col w-full">
          <div className="flex flex-col xl:flex-row gap-4 mr-4">
            <div className="flex-1 xl:w-1/2">
              <NonLoggedUsers />
            </div>
            <div className="flex-1 xl:w-1/2">
              <WorkingPattern />
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-4 mr-4">
            <div className="flex-1 xl:w-1/2">
              <UserComparisonChart />
            </div>
            <div className="flex-1 xl:w-1/2">
              <UserRecording />
            </div>
          </div>
          <div className="flex flex-col xl:flex-row gap-4 mr-4 ">
            <div className=" xl:w-1/2">
              <AverageWorkHours />
            </div>
          </div>
        </div>{" "}
      </ClaimsProvider>
    )
  );
};

export default Teaminfo;
