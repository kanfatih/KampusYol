import {createBrowserRouter} from "react-router-dom";
import Home from "/src/pages/home/index.jsx"
import MainLayout from "../layouts/index.jsx"
import Panel from "../pages/panel/index.jsx";
import Campus from "../pages/campus/index.jsx";
import Academy from "../pages/academy/index.jsx";
import Settings from "../pages/settings/index.jsx";
import Profile from "../pages/profile/index.jsx";

const routes = createBrowserRouter( [
    {
        path: "/",
        element: <MainLayout/>,

        children:[
            {
                index: true,
                element:<Home/>,
            },
            {
                path: "/panel",
                element:<Panel/>
            },
            {
                path: "/kampus",
                element: <Campus/>
            },
            {
                path: "/akademikTakvim",
                element: <Academy/>
            },

            {
                path: "/ayarlar",
                element: <Settings/>
            },
            {
                path: "/profil",
                element: <Profile/>
            }
        ]
    }
])

export default routes;