import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext';
import { FaBell, FaEnvelope,FaMoon,FaSun } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DarkModeToggler from '../../context/DarkModeToggler';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCounts, setUnreadCounts] = useState({
    total: 0,
    messages: 0,
    notifications: 0
  });
  console.log("user",user)

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/notification/unread-count', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        setUnreadCounts({
          total: response.data.unreadCount || 0,
          messages: response.data.unreadMessagesCount || 0,
          notifications: response.data.unreadNotificationsCount || 0
        });
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };
  
    if (user) {
      fetchUnreadCounts();
    }
  }, [user]);
  

  return (
    <header className='bg-gray-100 text-gray-900 border-b border-gray-300 p-4 flex justify-between items-center dark:border-gray-600 dark:bg-gray-900 dark:text-white'>
      <h1 className="text-lg font-semibold">
        Welcome, {user?.name}
      </h1>

      <div className="flex items-center space-x-6">
        <button className='text-2xl text-dark hover:rounded hover:cursor-pointer '>
            <DarkModeToggler  />
        </button>
        {user?.role === 'resident' && (
          <>
            <button
              onClick={() => navigate('/resident-dashboard/notifications')}
              title="Visit Request Notifications"
              className="relative hover:text-yellow-300 transition"
            >
              <FaBell size={22} />
              {unreadCounts.notifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCounts.notifications}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/resident-dashboard/Messages')}
              title="Contact Messages"
              className="relative hover:text-yellow-300 transition"
            >
              <FaEnvelope size={22} />
              {unreadCounts.messages > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCounts.messages}
                </span>
              )}
            </button>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <button
              onClick={() => navigate('/admin-dashboard/notifications')}
              title="Visit Request Notifications"
              className="relative hover:text-yellow-300 transition hover:rounded hover:cursor-pointer "
            >
              <FaBell size={22} />
              {unreadCounts.notifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCounts.notifications}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/admin-dashboard/Messages')}
              title="Contact Messages"
              className="relative hover:text-yellow-300 transition hover:rounded hover:cursor-pointer "
              
            >
              <FaEnvelope size={22} />
              {unreadCounts.messages > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCounts.messages}
                </span>
              )}
            </button>
          </>
        )}

        <button
          onClick={logout}
          className="bg-teal-700 hover:bg-teal-800 px-4 py-1 rounded transition hover:rounded hover:cursor-pointer"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;