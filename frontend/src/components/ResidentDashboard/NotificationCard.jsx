import React from 'react';
import { FaArrowRight } from "react-icons/fa"
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../context/authContext.jsx";

const RequestCard = ({ visitorName, visitPurpose, createdAt, isRead, Reason, onClick, isExpanded }) => {
  const { user } = useAuth();
  const { id } = useParams()
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
          <span className="font-semibold dark:text-white">{visitorName}</span> has requested to visit you for <span className="italic">{visitPurpose} Visit</span>.
        </p>
        <span className="text-xs text-gray-500 dark:text-white">{new Date(createdAt).toLocaleString()}</span>
      </div>

      {isExpanded && (
        <div className="mt-2 text-sm text-gray-700 space-y-1">
          <div className="flex items-center justify-between dark:text-white">
            <p className="mb-0">
              <strong>Reason:</strong> {Reason || 'No additional reason provided.'}
            </p>
            <button
              onClick={() => navigate(`/resident-dashboard/requests/${user._id}`)}
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
