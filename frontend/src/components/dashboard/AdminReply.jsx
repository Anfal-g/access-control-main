import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";

const AdminReply = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/contact/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setContact(response.data.contact);
      } catch (error) {
        console.error('Error fetching contact:', error);
      }
    };

    fetchContact();
  }, [id]);

  const handleChange = (e) => {
    setReplyMessage(e.target.value); // ✅ Only update the message string
  };

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:5001/api/contact/reply/${id}`,
        { message: replyMessage },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.data.success) {
        alert('Reply sent successfully');
        navigate('/admin-dashboard/contact');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  if (!contact) {
    return <div>Loading...</div>;
  }

  return (
    <div className='max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md w-96'>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-teal-600 hover:text-teal-800 mb-4 hover:cursor-pointer "
      >
        <FaArrowLeft className="mr-2" />
        Back
      </button>

      <h2 className='text-2xl font-bold mb-6'>Reply to Message</h2>

      <div>
        <label htmlFor="subject" className='text-sm font-medium text-gray-700'>Subject:</label>
        <input
          type="text"
          name='subject'
          value={contact.subject}
          disabled
          className='mt-1 w-full p-2 border border-gray-300 rounded-md'
          required
        />
      </div>

      <div>
        <label htmlFor="message" className='text-sm font-medium text-gray-700'>Message:</label>
        <input
          type="text"
          name='message'
          value={contact.message}
          disabled
          className='mt-1 w-full p-2 border border-gray-300 rounded-md'
          required
        />
      </div>

      <form onSubmit={handleReply}>
        <div className='mt-3'>
          <label htmlFor="reply" className='block text-sm font-medium text-gray-700'>Reply:</label>
          <textarea
            id="reply"
            className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
            rows="4"
            value={replyMessage} // ✅ Correct value
            onChange={handleChange} // ✅ Correct onChange
            required
          />
        </div>

        <button
          type="submit"
          className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded'
        >
          Send Reply
        </button>
      </form>
    </div>
  );
};

export default AdminReply;
