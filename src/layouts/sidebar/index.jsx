import Logo from "./logo/logo.jsx";
import LayoutButtons from "./buttons/index.jsx";
import LayoutInput from "./input/index.jsx";
;

export default function Sidebar({showSidebar,setShowSidebar}) {

    return (
        <div className="h-screen ">



            <div className={`
                    lg:bg-[#333661]  bg-[#434564] overflow-x-hidden
                    ${showSidebar ?  'fixed  mt-18 lg:mt-0   inset-0 z-30 flex flex-col w-full h-full' : 'hidden'} 
                    lg:relative lg:flex lg:flex-col lg:h-full lg:max-w-[300px] lg:min-w-[200px] lg:w-[20vw]
                `}>
                <Logo  showSidebar={showSidebar}  />
                <LayoutInput />
                <LayoutButtons setShowSidebar={setShowSidebar} showSidebar={showSidebar} />
            </div>
        </div>
    )
}