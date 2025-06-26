
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from "react"
import { AuthContext } from "../../contexts/authguard-context/Index"
import { Locationselect } from "../../shared/dropdown/LocationSelect"
import { ClaimsProvider } from "../../contexts/range-context";

import WorkSummary from "../../modules/dashboard/components/WorkSummary";
import ProductiveApp from "../../modules/dashboard/components/ProductiveApp";
import HolidayWorkSummary from "../../modules/dashboard/components/HolidayWorkSummary";
import ProductivityGraph from "../../modules/dashboard/components/ProductivityGraph";
import IpAddress from "../../modules/dashboard/components/IpAddress";


const Dashboard = () => {
  const authContext = useContext(AuthContext);

  // Ensure authContext is defined
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { admin,manager } = authContext;
  
 
  return (
    <><ClaimsProvider>
      {admin =='true'|| manager =='true' ? (
        <div className="flex flex-row mt-3">
          <div className="flex-1 xl:1/2">
          
            <Locationselect /> 
          </div>
        </div>
      ):<></>}

      <div className="flex flex-col xl:flex-col w-full  mr-4 pr-2 ">
        <div className="flex flex-col xl:flex-row gap-5">
          <div className="flex-1 xl:w-1/2">
                <WorkSummary /> 
          </div>
          <div className="flex-1 xl:w-1/2">
            <IpAddress />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-5 mx-2">
          <div className="flex-1 xl:w-1/2">
            <ProductivityGraph />
          </div>
          <div className="flex-1 xl:w-1/2">
            <ProductiveApp />
          </div>
        </div>
        {admin =='true'|| manager =='true' ? (
        <div className="flex flex-col xl:flex-row gap-5 mx-2">
        <div className="flex-1 xl:w-1/2 ">
          <HolidayWorkSummary />
        </div></div>
        ) :(<></>)}

      </div></ClaimsProvider>
    </>
  );
};

export default Dashboard;
