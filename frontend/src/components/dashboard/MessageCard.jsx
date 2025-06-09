import React from 'react';
import { FaArrowRight } from "react-icons/fa"
import { useNavigate } from 'react-router-dom';


const MessageCard = ({ subject, message, reply, date, isRead, onClick, isExpanded }) => {
  const navigate = useNavigate()

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer border p-4 rounded-lg mb-4 shadow transition-all dark:bg-gray-800 dark:text-white ${
        isRead ? 'bg-white' : 'bg-blue-50'
      }`}
    >
      <div className="flex justify-between items-center">
        <p className="text-gray-800 dark:text-white">
          <span className="font-semibold dark:text-white">You received a message</span> about "<span className="italic">{subject}</span>"
        </p>
        <span className="text-xs text-gray-500 dark:text-white">{date}</span>
      </div>

      {isExpanded && (
        <div className="mt-2 text-sm text-gray-700 space-y-1">
          <div className="flex items-center justify-between dark:text-white">
            <p><strong>Message:</strong> {message}</p>
            {/* <p><strong>Reply:</strong> {reply || 'No reply yet.'}</p> */}
            {/* <button
              onClick={() => navigate(`/admin-dashboard/contact`)}
              className="text-teal-600 hover:text-teal-800 ml-4"
            >
              <FaArrowRight />
            </button> */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin-dashboard/contact`);
              }}
              className="text-teal-600 hover:text-teal-800 flex items-center space-x-1"
            >
              <span>View Details</span>
              <FaArrowRight />
            </button>
          </div>
        </div>

      )}
    </div>
  );
};

export default MessageCard;
