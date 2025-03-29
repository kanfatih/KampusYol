
import {sidebarButtons} from "../../../utils/consts.jsx";
import {useNavigate} from "react-router-dom";
export default  function LayoutButtons({setShowSidebar, showSidebar}) {
    const navigate = useNavigate();
    return (
        <div className="  pl-4 max-w-[90%]  w-full  ">

            <button  className="text-white">
                {sidebarButtons.map((menu,key) => (

                   <div>
                       {menu.state && <button
                           className="flex cursor-pointer rounded-2xl hover:bg-gray-800 focus:bg-[#4c4f80]  lg:active:bg-transparent  active:bg-gray-500   w-full :my-4  p-1  "
                           onClick={
                           ()=> {
                               navigate(`${menu.path}`);
                               setShowSidebar(!showSidebar);
                           }
                       }

                           key={key}

                       >



                             <div> {menu.icon}</div>






                             <div className="flex justify-center items-center sm:font-bold sm:text-xl sm:ml-2 whitespace-nowrap  " >
                                 {menu.title}
                             </div>

                       </button>}
                   </div>
                ))}








            </button>


        </div>
    )
}