import React from 'react';
import { FaArrowRight } from "react-icons/fa";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";

const RequestCard = ({
  visitorName,
  visitPurpose,
  createdAt,
  isRead,
  Reason,
  onClick,
  isExpanded,
  status,
  residentName
}) => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const renderStatusText = () => {
    if (status === 'accepted') {
      return <span className="text-green-600 font-semibold">accepted</span>;
    } else if (status === 'rejected') {
      return <span className="text-red-600 font-semibold">rejected</span>;
    } //else {
    //   return <span className="text-gray-600 font-semibold">responded to</span>;
    // }
  };

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer border p-4 rounded-lg mb-4 shadow transition-all dark:bg-gray-800 dark:text-white ${
        isRead ? 'bg-white' : 'bg-blue-50'
      }`}
    >
      <div className="flex justify-between items-center ">
        <p className="text-gray-800 font-medium dark:text-white">
          <span className="text-gray-700 font-semibold dark:text-white ">{residentName}</span> has {renderStatusText()} the request from visitor <span className="font-semibold">{visitorName}</span>.
          {/* about <span className="italic text-gray-700">"{visitPurpose}"</span>  */} 
        </p>
        <span className="text-xs text-gray-500 dark:text-white">{new Date(createdAt).toLocaleString()}</span>
      </div>

      {isExpanded && (
        <div className="mt-2 text-sm text-gray-700 space-y-1">
          <div className="flex items-center justify-between dark:text-white">
            {Reason && (
              <p>
                <span className="font-semibold dark:text-white">Reason:</span> {Reason}
              </p>
            )}
          {/* <div className="mt-2 text-right"> */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin-dashboard/requests`);
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

export default RequestCard;
