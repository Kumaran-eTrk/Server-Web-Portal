/* eslint-disable react-hooks/rules-of-hooks */

import { Outlet } from 'react-router-dom';
import Sidebar from '../shared/sidebar';
import { useState } from 'react';
import { CancelIcon, MenuToggle } from '../shared/icons';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };
  const [logout, setLogout] = useState(false)

  return (
    <>
      <div className="flex  md:hidden"> {/* Show only on small devices */}
       
          {sidebarOpen ? <>
          <div  className=" flex bg-black  text-gray-900   py-3 flex items-center justify-center text-white w-20  border-r border-gray-200 bg-gray-800" onClick={toggleSidebar} >
           <CancelIcon/> 
           </div>
           </>: 
          <>
          <div className='text-black p-3 bg-transparent w-20' onClick={toggleSidebar}>
            <MenuToggle />
            </div>
           </>
            }
      
      </div>

      <div className={`flex flex-row md:flex-row w-screen h-screen bg-gray-100 overflow-hidden`}>
       
       <div >
       
        <Sidebar logout={logout} setLogout={setLogout} isOpen={sidebarOpen} />
        
        
        </div>
        
        <main className={`flex flex-col flex-1 mx-auto p-2 overflow-hidden  ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}

export default Layout;
