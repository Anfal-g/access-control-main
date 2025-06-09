import React, { useEffect, useState } from 'react';
import NotificationCard from './NotificationCard';
import axios from 'axios';

const Notification = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    fetchVisitRequests();
  }, []);


  const fetchVisitRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/notification/requestes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log("response",response);
      
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching visit requests:', error);
      setRequests([]);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post('http://localhost:5001/api/notification/markAllAsRead', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchVisitRequests();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleToggle = async (id) => {
    console.log('Notification ID:', id);

    const clicked = requests.find(n => n._id === id);
    console.log('Clicked Notification:', clicked);

    if (clicked && !clicked.isRead) {
      try {
        await axios.patch(`http://localhost:5001/api/notification/${id}/markAsRead`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setRequests((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }

    setExpandedId(expandedId === id ? null : id);
  };

  const filteredRequests = requests.filter((request) => {
    if (filter === 'all') return true;
    return filter === 'read' ? request.isRead : !request.isRead;
  });

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-gray-800 font-bold dark:text-white">
          Notifications
        </h2>
      </div>
        <>

        </>

        <>
        <div className="flex justify-between items-center mb-6">
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 hover:rounded hover:cursor-pointer "
            >
              Mark All as Read
            </button>
            <div className="space-x-2">
              {['all', 'read', 'unread'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded hover:rounded hover:cursor-pointer  ${
                    filter === type ? 'bg-teal-600 text-white' : 'bg-gray-200 hover:bg-gray-500 dark:bg-white/10'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
        {filteredRequests.length === 0 ? (
            <p className="text-gray-600">No notifications available.</p>
          ) : (
            filteredRequests.map((request) => (
              console.log('Request:', request),
              console.log('Request ID:', request._id),
              <NotificationCard
                key={request._id}
                visitorName={request.visitRequest.visitorName}
                visitPurpose={request.visitRequest.visitPurpose}
                Reason={request.visitRequest.customReason}
                createdAt={request.createdAt}
                isRead={request.isRead}
                onClick={() => handleToggle(request._id)}
                isExpanded={expandedId === request._id}
              />
            ))
          )}
        </>
    </div>
  );
};

export default Notification;
