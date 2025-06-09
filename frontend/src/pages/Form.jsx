import React, { useState } from 'react';
import axios from 'axios';

const Form = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    visitType: '',
    visitReason: '',
    targetResidentName: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('')
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setErrorMessage(''); 
    setSuccessMessage('');
    
    try {
      const response = await axios.post('http://localhost:5001/api/request/add', formData, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.data.success) {
        setSuccessMessage(response.data.message);
        // Reset form
        setFormData({
          fullName: '',
          phone: '',
          visitType: '',
          visitReason: '',
          targetResidentName: '',
        });
      } else {
        setErrorMessage(response.data.error || response.data.message || "Request failed");
      }
    } catch (error) {
      console.log("Error details:", error);
      
      if (error.response) {
        setErrorMessage(error.response.data?.error || 
                       error.response.data?.message || 
                       "Request failed");
      } else if (error.request) {
        setErrorMessage("No response from server. Please try again.");
      } else {
        setErrorMessage("An error occurred: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 to-teal-200 p-6">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-8 border border-teal-300">
        <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">
          Visitor Request Form
        </h2>
        {/* {successMessage && <div className="bg-green-100 text-green-800 p-3 mb-4 rounded">{successMessage}</div>}
        {errorMessage && <div className="bg-red-100 text-red-800 p-3 mb-4 rounded">{errorMessage}</div>} */}

        {/* Success Message */}
        {successMessage && (
            <div className="bg-green-100 text-green-800 p-3 mb-4 rounded">
            {successMessage}
            </div>
        )}
        
        {/* Error Message */}
        {errorMessage && (
            <div className="bg-red-100 text-red-800 p-3 mb-4 rounded">
            {errorMessage}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 focus:border-teal-500 focus:ring-teal-500 px-4 py-2 rounded-lg shadow-sm"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 focus:border-teal-500 focus:ring-teal-500 px-4 py-2 rounded-lg shadow-sm"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Visted Resident</label>
            <input
              type="text"
              name="targetResidentName"
              value={formData.targetResidentName}
              onChange={handleChange}
              placeholder="Resident Name"
              className="mt-1 w-full border border-gray-300 focus:border-teal-500 focus:ring-teal-500 px-4 py-2 rounded-lg shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Visit Type *</label>
            <select
              name="visitType"
              value={formData.visitType}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 focus:border-teal-500 focus:ring-teal-500 px-4 py-2 rounded-lg shadow-sm"
            >
              <option value="">-- Select --</option>
              <option value="delivery">Delivery</option>
              <option value="service">Service Worker</option>
              <option value="meet-resident">Meet Resident</option>
              <option value="meet-admin">Meet Admin</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* {formData.visitType === "other" && ( */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Explain the Reason</label>
              <input
                type="text"
                name="visitReason"
                value={formData.visitReason}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 focus:border-teal-500 focus:ring-teal-500 px-4 py-2 rounded-lg shadow-sm"
                placeholder="Enter reason"
              />
            </div>
          {/* )} */}

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;
