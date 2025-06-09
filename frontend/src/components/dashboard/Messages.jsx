import React, { useEffect, useState } from 'react';
import MessageCard from './MessageCard';
import axios from 'axios';

const Messages = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/notification/messages', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log("response",response)
      // Filter out notifications that don't have contact info
      const contactNotifications = response.data.notifications.filter(
        notification => notification.contact
      );
      
      setNotifications(contactNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post('http://localhost:5001/api/notification/markAllAsRead', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleToggle = async (id) => {
    const clicked = notifications.find(n => n._id === id);

    if (clicked && !clicked.isRead) {
      try {
        await axios.patch(`http://localhost:5001/api/notification/${id}/markAsRead`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }

    setExpandedId(expandedId === id ? null : id);
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true;
    return filter === 'read' ? notification.isRead : !notification.isRead;
  });

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-gray-800 font-bold dark:text-white">Messages</h2>
      </div>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={markAllAsRead}
          className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
        >
          Mark All as Read
        </button>
        <div className="space-x-2">
          {['all', 'read', 'unread'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded ${
                filter === type ? 'bg-teal-600 text-white' : 'bg-gray-200 hover:bg-gray-500 dark:bg-white/10'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <p className="text-gray-600 ">No Messages available.</p>
      ) : (
        filteredNotifications.map((notification) => (
          <MessageCard
            key={notification._id}
            subject={notification.contact.subject}
            message={notification.contact.message}
            reply={notification.contact.reply?.message}
            date={new Date(notification.createdAt).toLocaleString()}
            isRead={notification.isRead}
            onClick={() => handleToggle(notification._id)}
            isExpanded={expandedId === notification._id}
          />
        ))
      )}
    </div>
  );
};

export default Messages;