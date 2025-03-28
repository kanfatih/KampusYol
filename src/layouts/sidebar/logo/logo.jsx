import logo from "../../../assests/images/logo.png";
import {useNavigate} from "react-router-dom";
import classNames from "classnames";
export default function Logo({showSidebar}) {
    const navigate = useNavigate();
  return (
<div >

    <div     className={classNames("flex cursor-pointer  m-auto lg:pt-2 lg:mt-4   items-center justify-center ",{
                hidden: showSidebar



    } )}
             onClick={()=>navigate("/")}
    >
        <div className=" flex  w-[40px]  h-[40px]  lg:w-[4vw] lg:h-[4vw] lg:min-h-[2vw] lg:min-w-[2vw]    lg:m-0.5 rounded-full    bg-white ">
            <img
                className="flex justify-center items-center   lg:w-[4vw] lg:h-[4vw]   lg:min-h-[2vw] lg:min-w-[2vw] w-[40px]  h-[40px]   "
                src={logo}
                alt="Logo"
            />
        </div>
        <div className="flex    justify-center items-center text-[20px] mx-2    lg:text-[20px]  ">
            <div className="    font-extrabold     text-[#E8A054] ">KAMPÜS</div>
            <div className="  font-bold text-white flex leading-1  ">YOL</div>
        </div>


    </div>

    <div  className=" border-gray-500   border:hidden   lg:border-b-[0.2px] mt-1  w-full"></div>

</div>

  );
}

