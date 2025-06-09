import React from "react";
import { useAuth } from "../context/authContext"
import AdminSidebar from "../components/dashboard/AdminSidebar";
import Navbar from "../components/dashboard/Navbar";
import AdminSummary from "../components/dashboard/AdminSummary";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";

const AdminDashboard = ()=>{
    //print the user name
    const {user} = useAuth()

    return(
        <ThemeProvider>
            <div className="flex">
                <AdminSidebar/>
                <div className='grow ml-16 md:ml-64 h-full lg:min-h-screen bg-gray-100 text-gray-900
                dark:bg-gray-900 dark:text-white'>
                    <Navbar />
                    <div>
                        <Outlet />
                    </div>
                </div>
                {/*<div className="flex-1 ml-64 bg-gray-100 h-screen"> {/* it take the whole area without the admineSidebar */}
                    {/* <Navbar /> */}
                        {/* <AdminSummary /> ** //display the componenets of parents route */}
                    {/* <div>Dashboard Overview</div> */}
                    {/* display dynamicly the comonantes of this parents (dash)  
                    <Outlet/> 
                </div>*/}
            </div>
        </ThemeProvider>
    )
}

export default AdminDashboard