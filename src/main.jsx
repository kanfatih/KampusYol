import React from 'react';
import { createRoot } from 'react-dom/client'
import {Provider} from "react-redux";
import {RouterProvider} from "react-router-dom";
import routes from "./routes/index.jsx";
import "./assests/css/tailwind.css"
createRoot(document.getElementById('root')).render(


        <RouterProvider router={routes} />











)
