/* eslint-disable @typescript-eslint/no-explicit-any */

import { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/authguard-context/Index";
import { useRangeContext } from "../../contexts/range-context";
import { useOutClick } from "../../customhooks/useOutsideClick";
import {
  AdminSidebar,
  ManagerSidebar,
  SysTeamSidebar,
} from "../../lib/constants";

import Logout from "../../modules/loginpage/components/LogOut";
import ProductKey from "../Productkey";
import ChangePassword from "../../modules/loginpage/components/ChangePassword";

const Sidebar = ({ logout, setLogout, isOpen }: any) => {
  const [active, setActive] = useState("");
  const [modal, setModal] = useState(false);

  // Check if the user is admin or manager

  const location = useLocation();
  const {
    resetpopup,
    setResetPopup,
    productkey,
    setProductKey,
  }: any = useRangeContext();
  const authContext : any = useContext(AuthContext);
  const {admin,manager,sysadmin} = authContext;
  const hasAdmin = admin == "true";
  const hasManager = manager == "true";
  const hasSystem = sysadmin == "true";
  const handleItemClick = (itemId: any) => {
    setActive(itemId);
  };

  const ref: any = useOutClick(() => {
    setModal(false);
  });

  const handleSubmit = () => {
    setLogout(!logout);
    setModal(!modal);
  };

  const handlePopup = () => {
    setResetPopup(!resetpopup);
  };

  const ProductKeyPopup = () => {
    setProductKey(!productkey);
  };

  const mergeSidebars = () => {
    const mergedSidebar : any[] = [];
    const seen = new Set();

    const addItems = (items:any) => {
      items.forEach((item:any) => {
        if (!seen.has(item.id)) {
          mergedSidebar.push(item);
          seen.add(item.id);
        }
      });
    };

    if (hasAdmin) addItems(AdminSidebar);
    if (hasManager) addItems(ManagerSidebar);
    if (hasSystem) addItems(SysTeamSidebar);

    return mergedSidebar;
  };


  const sidebarData = mergeSidebars();

  const renderNavLinks = (data:any) => {
    return data.map((item:any, index:string) => (
      <a
        key={index}
        href={item.routeLink}
        className={`group relative rounded-xl p-2 hover:bg-cyan-500 ${
          item.routeLink.includes(location.pathname)
            ? "bg-[#26C0BB]"
            : "bg-gray-800"
        }`}
        onClick={() => handleItemClick(item.id)}
      >
        <span>{item.icon}</span>
        <div className="absolute inset-y-0 left-12 hidden items-center group-hover:flex">
          <div className="relative whitespace-nowrap rounded-md bg-white px-4 z-10 py-2 text-sm font-semibold text-gray-900 drop-shadow-lg">
            <div className="absolute inset-0 -left-1 flex items-center">
              <div className="h-2 w-2 rotate-45 bg-white"></div>
            </div>
            {item.label}
          </div>
        </div>
      </a>
    ));
  };

  return (
    <>
      <div
        className={`flex bg-black text-gray-900 md:relative fixed z-10  ${
          isOpen ? "flex" : "hidden md:flex"
        }`}
      >
        <aside className="flex h-screen w-20 flex-col items-center border-r relative  border-gray-200 bg-gray-800">
          <div className="flex h-[4.5rem] w-full items-center justify-center border-b border-gray-200 p-4">
            <img src="./Sidebar_Logo.png" />
          </div>
        
          <nav className="flex flex-1 flex-col gap-y-4 pt-10">
            {renderNavLinks(sidebarData)}
          </nav>
          

          <div className="flex flex-col items-center gap-y-4 py-10 absolute bottom-3">
            <button className="mt-2 rounded-full bg-gray-100">
              <div
                className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600"
                onClick={() => setModal(!modal)}
              >
                <svg
                  className="absolute w-12 h-12 text-gray-400 -left-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </button>
          </div>
        </aside>
      </div>
      <div ref={ref}>
        {modal && (
          <div className="absolute left-16 bottom-10 z-10 flex flex-col bg-white p-3 rounded-md shadow-md">
            <div className=" ">
              <h3
                className="text-md hover:bg-gray-200 p-2  py-1 px-1 rounded-md cursor-pointer mb-1 "
                onClick={handleSubmit}
              >
                Log out
              </h3>
            </div>
            {hasAdmin && (
              <div className=" ">
                <h3
                  className="text-md hover:bg-gray-200 p-2  py-1 px-1 rounded-md cursor-pointer mb-1 "
                  onClick={() => {
                    ProductKeyPopup();
                  }}
                >
                  Product Key
                </h3>
              </div>
            )}

            {import.meta.env.VITE_DB_AUTH == "TRUE" ? (
              <div className=" ">
                <h3
                  className="text-md hover:bg-gray-200 p-2  py-1 px-1 rounded-md cursor-pointer mb-1 "
                  onClick={handlePopup}
                >
                  Reset password
                </h3>
              </div>
            ) : (
              ""
            )}
          </div>
        )}
      </div>
      {productkey && (
        <div className="fixed inset-0 z-10 flex items-center justify-center mx-auto p-2 bg-opacity-30  backdrop-blur-sm overflow-y-auto">
          <ProductKey />
        </div>
      )}
      {logout && (
        <div className="fixed inset-0 z-10 flex items-center justify-center mx-auto p-2 bg-opacity-30  backdrop-blur-sm overflow-y-auto">
          <Logout logout={logout} setLogout={setLogout} />
        </div>
      )}
      {resetpopup && (
        <div className="fixed inset-0 z-10 flex items-center justify-center mx-auto p-2 bg-opacity-30 backdrop-blur-sm overflow-y-auto">
          <ChangePassword />
        </div>
      )}
    </>
  );
};

export default Sidebar;
