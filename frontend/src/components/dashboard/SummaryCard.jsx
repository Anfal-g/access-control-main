import React from 'react';

export const SummaryCard = ({ icon, text, number, color }) => {
  return (
    <div className='bg-white text-dark p-4 rounded-lg shadow-md flex items-center space-x-6
    dark:bg-gray-800 dark:text-white'>
      <div className={`${color} text-white rounded-full p-3 mr-4 text-3xl flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className='text-lg font-semibold'>{text}</p>
        <p className='text-xl'>{number}</p>
      </div>
    </div>
  );
};

export default SummaryCard;
