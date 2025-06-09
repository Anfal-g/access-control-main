import React, { useState } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom'

export default function Contact() {
  const Navigate = useNavigate()
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

  const handleChange =(e)=>{
    const {name,value} =e.target;
    //update the contact object if name or desc
    setFormData({...formData, [name] : value})
 }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        'http://localhost:5001/api/contact/add',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if(response.data.success){
        setSuccessMessage('Message sent successfully!');
        setErrorMessage('');
        // setFormData({ subject: '', dateSent: '', message: '' });
        Navigate("/resident-dashboard")
      }

    } catch (error) {
      console.log(error)
      setErrorMessage('Failed to send message. Please try again.');
      setSuccessMessage('');
      if(error.response && !error.response.data.success){
        alert(error.response.data.error)
      }
    }
  };

  return (
    <div className='max-w-xl mx-auto mt-10 bg-white p-10 rounded-md shadow-md dark:bg-gray-800 dark:text-white'>
      <h2 className='text-2xl font-bold mb-6'>Contact Support</h2>

      {successMessage && <div className="bg-green-100 text-green-800 p-3 mb-4 rounded">{successMessage}</div>}
      {errorMessage && <div className="bg-red-100 text-red-800 p-3 mb-4 rounded">{errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          {/* Subject */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Subject</label>
            <input 
              type="text" 
              name="subject" 
              placeholder='Subject'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              onChange={handleChange} 
              value={formData.subject}
              required 
            />
          </div>

          {/* Date Sent */}
          {/* <div>
            <label className='block text-sm font-medium text-gray-700'>Date Sent</label>
            <input 
              type="date" 
              name="dateSent" 
              placeholder='Date Sent'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              onChange={handleChange} 
              value={formData.dateSent}
              required 
            />
          </div> */}

          {/* Message */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Message</label>
            <textarea 
              name="message"
              className="w-full border border-gray-300 p-2 rounded-md"
              rows="4"
              placeholder="Write your message..."
              onChange={handleChange}
              value={formData.message}
              required
            ></textarea>
          </div>
        </div>

        <button 
          type='submit'
          className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md hover:rounded hover:cursor-pointer '
        >
          Send
        </button>
      </form>
    </div>
  );
}
