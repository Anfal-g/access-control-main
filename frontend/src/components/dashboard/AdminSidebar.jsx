import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaBan, FaBuilding, FaClipboardList, FaCog,
  FaFacebookMessenger, FaHome, FaTachometerAlt, FaUsers,FaPaperPlane ,FaUsersCog
} from "react-icons/fa";

const links = [
  { to: "/admin-dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
  { to: "/admin-dashboard/residents", label: "Residents", icon: <FaUsers /> },
  { to: "/admin-dashboard/apartments", label: "Apartments", icon: <FaHome /> },
  { to: "/admin-dashboard/entrylogs", label: "Entry Logs", icon: <FaClipboardList /> },
  { to: "/admin-dashboard/contact", label: "Messages", icon: <FaFacebookMessenger /> },
  { to: "/admin-dashboard/request", label: "send Request", icon: <FaPaperPlane  /> },
  { to: "/admin-dashboard/blocklist", label: "Block List", icon: <FaBan /> },
  { to: "/admin-dashboard/requests", label: "Visitor Request", icon: <FaUsersCog /> },
  { to: "/admin-dashboard/building", label: "Building", icon: <FaBuilding /> },
  { to: "/admin-dashboard/setting", label: "Settings", icon: <FaCog /> }, 

];

const AdminSidebar = () => {
  return (
    <div className="bg-gray-100 text-gray-900 h-screen px-4 fixed w-16 md:w-64 border-r border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white">
      {/* Logo Section */}
      {/* <div className="bg-teal-600 h-16 flex items-center justify-center"> */}
        <h1 className='text-2xl font-bold hidden md:block mt-4 text-center italic' >MS</h1>
      {/* </div> */}

      {/* Navigation Links */}
      <div className='flex flex-col mt-5 text-xl'>
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center py-3 px-2 space-x-4 hover:rounded hover:cursor-pointer 
               hover:text-white hover:bg-blue-600 ${
                isActive ? "bg-teal-500" : "hover:bg-gray-700"
              }`
            }
            end
          >
            <div>{icon}</div>
            <span className="hidden md:inline ">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
