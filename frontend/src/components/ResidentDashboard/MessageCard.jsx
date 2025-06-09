import React from 'react';

const MessageCard = ({ subject, message, reply, date, isRead, onClick, isExpanded }) => {
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
        <div className="mt-2 text-sm text-gray-700 space-y-1 dark:text-white">
          <p><strong>Message:</strong> {message}</p>
          <p><strong>Reply:</strong> {reply || 'No reply yet.'}</p>
        </div>
      )}
    </div>
  );
};

export default MessageCard;
