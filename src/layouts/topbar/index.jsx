import classNames from "classnames";
import Logo from "../sidebar/logo/logo.jsx";
import {useNavigate} from "react-router-dom";

export default function TopBar({ showSidebar, setShowSidebar }) {
    const navigate = useNavigate();
    return (
        <div className="lg:hidden">
            <div
                className={classNames(" h-18 flex items-center w-full ", {
                    "bg-[#333660]": showSidebar,
                    "bg-[#333661]": !showSidebar,
                })}
            >

                <div className="left-2 top-1">
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className={classNames("text-white  p-2 m-2 rounded-md", {
                            "bg-[#4b5768]": showSidebar,

                            "bg-gray-500": !showSidebar,

                        })}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
                            />
                        </svg>
                    </button>
                </div>


                <div className="mx-auto">
                    <Logo />
                </div>

                <div onClick={()=>navigate("/profil")} >
                    <button className=" mr-1 "  >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-white ">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>

                    </button>
                </div>

            </div>

            <div className="w-full border-b border-gray-200" />
        </div>
    );
}
