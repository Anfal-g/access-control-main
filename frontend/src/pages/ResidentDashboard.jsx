import React from "react";
import SideBar from "../components/ResidentDashboard/SideBar.jsx"
import Navbar from "../components/dashboard/Navbar.jsx"
import {Outlet} from 'react-router-dom'
import Summary from "../components/ResidentDashboard/Summary.jsx";
import { ThemeProvider } from "../context/ThemeContext";

const ResidentDashboard = ()=>{
    return(
        <ThemeProvider>
            <div className="flex">
                <SideBar/>
                <div className='grow ml-16 md:ml-64 h-full lg:min-h-screen bg-gray-100 text-gray-900
                    dark:bg-gray-900 dark:text-white'>
                    <Navbar />
                    <div>
                        <Outlet />
                    </div>
                </div>
            </div>
        </ThemeProvider>
    )
}

export default ResidentDashboard