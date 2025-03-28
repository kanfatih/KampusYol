import {createBrowserRouter} from "react-router-dom";
import Home from "/src/pages/home/index.jsx"
import MainLayout from "../layouts/index.jsx"

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
                element:"panel-girisi"
            },
            {
                path: "/kampus",
                element: "kampüs"
            },
            {
                path: "/akademikTakvim",
                element: "Akademik takvim",
            },

            {
                path: "/ayarlar",
                element: "Ayarlar",
            },
            {
                path: "/profil",
                element: "profil sayfası",
            }
        ]
    }
])

export default routes;