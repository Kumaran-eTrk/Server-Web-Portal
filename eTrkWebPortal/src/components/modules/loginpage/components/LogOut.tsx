/* eslint-disable @typescript-eslint/no-explicit-any */

import { UserAgentApplication } from "msal";
import { useNavigate } from "react-router-dom";

const Logout = ({ logout, setLogout }: any) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const azureConfig = {
      clientId: import.meta.env.VITE_AZURE_CLIENTID,
      authority: import.meta.env.VITE_AZURE_AUTHORITY,
    };

    const userAgentApplication = new UserAgentApplication({
      auth: {
        clientId: azureConfig.clientId,
        authority: azureConfig.authority,
      },
    });

    // Check if the user is logged in before attempting to log out
    const userIsLoggedIn = userAgentApplication.getAccount() !== null;

    if (userIsLoggedIn) {
      console.log("Logging out...");
      try {
        await userAgentApplication.logout();
        console.log("Logout successful");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    } else {
      console.log("User is not logged in");
    }
    localStorage.clear();

    navigate("/");

    localStorage.removeItem("username");
    localStorage.removeItem("auth");
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("role");
    localStorage.removeItem("domain");
    localStorage.removeItem("auth");
    localStorage.removeItem("admin");
    localStorage.removeItem("manager");
    localStorage.removeItem("selectedDatearange");
    localStorage.removeItem("startDateApp");
    localStorage.removeItem("endDateApp");
    localStorage.removeItem("startDate");
    localStorage.removeItem("endDate");
    localStorage.removeItem("Manager");

    if (
      !localStorage.getItem("auth") &&
      !localStorage.getItem("username") &&
      !localStorage.getItem("accesstoken")
    ) {
      navigate("/"); // Change this line to navigate to '/'
    }
  };

  return (
    <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 bg-white p-6 shadow rounded-xl">
      <span className="text-lg ">Are you sure you want to Logout?</span>
      <div className="flex justify-end mt-4 gap-3 ">
        <button
          className="p-2 w-20 border border-bg-gray-500 rounded-md hover:bg-[#26C0BB] hover:text-white"
          onClick={() => setLogout(!logout)}
        >
          NO
        </button>
        <button
          className="bg-[#26C0BB] p-2 w-20 border border-bg-[#26C0BB] rounded-md text-white"
          onClick={handleLogout}
        >
          Yes
        </button>
      </div>
    </div>
  );
};

export default Logout;
