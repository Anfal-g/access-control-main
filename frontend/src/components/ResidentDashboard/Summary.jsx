import React from 'react';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/authContext.jsx';

export const Summary = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-2xl shadow-lg flex items-center p-6">
        <div className="text-4xl bg-white text-teal-600 rounded-full p-3 shadow-md mr-6">
          <FaUser />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-200">Welcome back,</p>
          <p className="text-2xl font-bold">{user.name}</p>
        </div>
      </div>
    </div>
  );
};

export default Summary;
