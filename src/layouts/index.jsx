import { Outlet } from 'react-router-dom';
import Sidebar from "./sidebar/index.jsx";
import TopBar from "./topbar/index.jsx";
import {useState} from "react";



export default function MainLayout() {
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <div className="h-screen flex flex-col " >


            <header className="w-full h-16 z-50  fixed  lg:relative  ">
                <TopBar showSidebar={showSidebar} setShowSidebar={setShowSidebar}   />
            </header>
          <main className=" flex  flex-1 h-full  ">
             <main className="h-full ">
                 <Sidebar showSidebar={showSidebar}  />
             </main>
              <main className="flex-1 overflow-auto pt-25 lg:pt-0  p-4 bg-gray-100 w-full lg:w-auto">
                  <Outlet />
              </main>
          </main>

        </div>
    );

}