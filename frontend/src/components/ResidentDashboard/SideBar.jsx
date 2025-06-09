import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaBuilding, FaCalendarAlt, FaCog, FaTachometerAlt, FaUserCheck, FaUsers,FaClipboardList ,FaTasks ,
  FaUserCog ,FaUsersCog 
} from "react-icons/fa";
import { useAuth } from "../../context/authContext.jsx";

const Sidebar = () => {
  const { user } = useAuth();

  const links = [
    { to: "/resident-dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: `/resident-dashboard/profile/${user._id}`, label: "My Profile", icon: <FaUsers /> },
    { to: `/resident-dashboard/contact`, label: "Contact", icon: <FaCalendarAlt /> },
    { to: `/resident-dashboard/visitors/${user._id}`, label: "Visitor List", icon: <FaUserCheck /> },
    { to: `/resident-dashboard/requests/${user._id}`, label: "Visitor Request", icon: <FaUsersCog /> },
    { to: "/resident-dashboard/setting", label: "Settings", icon: <FaCog /> },

  ];

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

export default Sidebar;
