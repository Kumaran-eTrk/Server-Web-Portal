

import { useEffect, useState } from "react";

import { Dismiss16Regular, Checkmark16Regular } from "@fluentui/react-icons";

import api from "../../../../interceptors";
import { Button, Tooltip } from "@fluentui/react-components";


export type Item = {
  id: string;
  username: string;
  name: string;
  browser: string;
  status: string;
  buttonfield: JSX.Element;
};
const Extension = () => {
  const [browserExtension, setBrowserExtension] = useState([]);
  const currentDate = new Date();

  useEffect(() => {
    const fetchBrowserExtensionData = async () => {
      try {
        const response = await api.get(`/GetAllExtentions`);
        const data = response.data;

        const sortedData = data.sort((a: any, b: any) => {
          const userNameA = a.username.toLowerCase();
          const userNameB = b.username.toLowerCase();
          return userNameA.localeCompare(userNameB);
        });
      
        setBrowserExtension(sortedData);
      } catch (error) {
        console.error("Error fetching Extension data:", error);
      }
    };

    fetchBrowserExtensionData();
  }, []);

  const handleApproveChange = async (id: any, checked: any) => {
    try {
      const dataToPost = {
        id: id,
        name: "string",
        description: "string",
        version: "string",
        permissions: ["string"],
        browser: "string",
        username: "string",
        status: true,
        modifiedDatetime: "2024-01-08T17:16:17.004Z",
        approval: checked,
      };
      const responses = await api.put(`/updateinfo`, dataToPost);
      console.log("data", responses);
      if (responses.status === 200) {
        console.log("updated");
      }
      const response = await api.get("/GetAllExtentions");
      const data = response.data;
      const sortedData = data.sort((a: any, b: any) => {
        const userNameA = a.username.toLowerCase();
        const userNameB = b.username.toLowerCase();
        return userNameA.localeCompare(userNameB);
      });

      setBrowserExtension(sortedData);
    } catch (error) {
      console.error("Error in browser extension update:", error);
    }
  };

  return (
    <div className="mt-8 flex flex-wrap space-x-0 space-y-2 md:space-x-4 md:space-y-0 ">
      <div className="flex-1 bg-white p-5 shadow rounded-lg w-full md:w-1/2 ">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start justify-between ">
            <h2 className="flex text-gray-500 text-lg font-semibold pb-1">
              Browser Extensions
            </h2>
            <div className="flex text-sm">
              {currentDate.toISOString().split("T")[0]}
              <span className="px-1">to</span>
              {currentDate.toISOString().split("T")[0]}
            </div>
          </div>
        </div>
        <div className="my-1"></div>
        <div className="bg-gradient-to-r from-[#26C0BB] to-[#26C0BB] h-px "></div>

        <div className="flex flex-wrap justify-between mt-4 h-32 overflow-y-scroll overscroll-x-none ">
          <table className="w-full table-auto ml-2 text-sm text-center">
            <thead className="sticky top-0.5 z-0">
              <tr className="bg-[#26C0BB] w-full">
                <th className="text-white text-sm px-6 py-2">Dev Name</th>
                <th className="text-white text-sm px-6 py-2">Name</th>
                <th className="text-white text-sm px-6 py-2">Browser</th>
                <th className="text-white text-sm px-6 py-2">Status</th>
                <th className="text-white text-sm px-6 py-2 w-28 mr-3 text-left">
                  Approve/Reject
                </th>
              </tr>
            </thead>
            <tbody>
              {browserExtension.length === 0 ? (
                <tr>
                  <td className="text-center text-gray-500 py-4 " colSpan={4}>
                    No records found
                  </td>
                </tr>
              ) : (
                browserExtension.map((item: Item, index): any => (
                  <tr key={index}>
                    <td className="border-b-2 py-2">{item.username}</td>
                    <td className="border-b-2 py-2">{item.name}</td>
                    <td className="border-b-2 py-2">{item.browser}</td>
                    
                    <td className="border-b-2 py-2">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "4px",
                        }}
                      >
                        <Tooltip content="Approve" relationship="label">
                          <Button
                            onClick={() => handleApproveChange(item.id, 1)}
                            style={{ backgroundColor: "#00b300" }}
                            size="small"
                            icon={<Checkmark16Regular />}
                          ></Button>
                        </Tooltip>
                        <Tooltip content="Reject" relationship="label">
                          <Button
                            onClick={() => handleApproveChange(item.id, 2)}
                            style={{ backgroundColor: "#ff0000" }}
                            size="small"
                            icon={<Dismiss16Regular />}
                          ></Button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Extension;
