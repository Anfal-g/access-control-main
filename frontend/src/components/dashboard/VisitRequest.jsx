import React, { useState, useEffect } from "react";
import axios from "axios";
import { fetchApartments } from '../../utils/ResidentHelper.jsx'
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const VisitRequest = () => {
  const [apartments ,setApartments] = useState([])
  const [residents, setResidents] = useState([]);
  const [formData, setFormData] = useState({
    apartment: "", 
    targetResident: "",
    visitorName: "",
    visitorPhone: "",
    type: "single",
    visitPurpose: "personal",
    customReason: "",
    visitTimeFrom: "",
    visitTimeTo: "",
    visitDate: "",  
  });
  const Navigate = useNavigate()
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(()=>{ 
    const getApartments = async () => {
      const apartments = await fetchApartments()
      setApartments(apartments)
    }
    getApartments()
  },[])


  const handleChange = async (e) => {
    const { name, value } = e.target;
  
    // Update form data
    setFormData((prev) => ({ ...prev, [name]: value }));
  
    // Only run this when apartment changes
    if (name === "apartment") {
      const selectedApartment = apartments.find(aprt => aprt._id === value);
      const apartmentName = selectedApartment?.apartment_name;
      console.log("Selected apartment name:", apartmentName);
      console.log("Selected apartment ID:", value);
  
      try {
        const response = await axios.get(
          `http://localhost:5001/api/request/${value}`,
          {
            headers:{
                "Authorization": `Bearer ${localStorage.getItem('token')}`
              }
          }
        );
        console.log("Response data:", response);
        // console.log("Residents fetched:", response.data.residents);
        setResidents(response.data.residents);
      } catch (err) {
        console.error("Failed to fetch residents for selected apartment", err);
      }
    }
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setErrorMessage(''); 
    setSuccessMessage(''); 
    console.log("Submitting visit request:", formData);

    try {
      const response = await axios.post('http://localhost:5001/api/request/add',
        formData,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      console.log("Response data:", response.data);
      if (response.data.success) {
        setFormData({
            apartment: "", 
            targetResident: "",
            visitorName: "",
            visitorPhone: "",
            type: "single",
            visitPurpose: "personal",
            customReason: "",
            visitTimeFrom: "",
            visitTimeTo: "",
            visitDate: "",  
          });
        setSuccessMessage('Visit request sent successfully!');
        setErrorMessage('');
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } 
    }
  };

  return (
    <div className='max-w-4xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md dark:bg-gray-800 dark:text-white'>
      <button onClick={() => Navigate(-1)}
        className="flex items-center text-teal-600 hover:text-teal-800 mb-4 hover:cursor-pointer "
      >
        <FaArrowLeft className="mr-2" />
        Back
      </button>
      <h2 className='text-2xl font-bold mb-6'>Send Visit Request</h2>
      {successMessage && <div className="bg-green-100 text-green-800 p-3 mb-4 rounded">{successMessage}</div>}
      {errorMessage && <div className="bg-red-100 text-red-800 p-3 mb-4 rounded">{errorMessage}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className='block text-sm font-medium'>Apartment</label>
            <select type="text" name="apartment" 
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white'
              onChange={handleChange} 
              value={formData.apartment}
              required >
              <option value="">Select Apartment</option>
              {apartments.map(aprt =>(
                <option key={aprt._id} value={aprt._id}> {aprt.apartment_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium '>Residents</label>
            <select
                name="targetResident"  // ✅ use correct field name
                className='mt-1 p-2 block w-full border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white'
                onChange={handleChange}
                value={formData.targetResident}

                required
                >
                <option value="">Select Resident</option>
                {residents.map(res => (
                    <option key={res._id} value={res._id}>
                    {res.userId?.name}
                    </option>
                ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className='block text-sm font-medium '>Visitor Name</label>
            <input type="text" name="visitorName" placeholder='Insert Name'
            className='mt-1 p-2 block w-full border border-gray-300 rounded-md '
            required 
            value={formData.visitorName}
            onChange={handleChange}
            />
          </div>

          <div>
            <label className='block text-sm font-medium '>Phone</label>
            <input type="tel" name="visitorPhone" placeholder='Phone'
            className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
            onChange={handleChange} 
            value={formData.visitorPhone}
            required />
          </div>

         <div>
           <label className="block mb-1 font-medium">Visit Type</label>
           <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white"
            >
            <option value="single">Single</option>
            <option value="group">Group</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Visit Purpose</label>
          <select
            name="visitPurpose"
            value={formData.visitPurpose}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white"
          >
            <option value="personal">Personal</option>
            <option value="delivery">Delivery</option>
            <option value="maintenance">Maintenance</option>
            <option value="service">Service Worker</option>
            <option value="others">Others</option>
          </select>
        </div>

        {/* {formData.visitPurpose === "others" && ( */}
          <div>
            <label className="block mb-1 font-medium">Custom Reason</label>
            <input
              type="text"
              name="customReason"
              value={formData.customReason}
              onChange={handleChange}
              placeholder='Reason'
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        {/* )} */}
        <div className="flex-1">
          <label className="block mb-1 font-medium">Visit Date</label>
          <input
            type="date"
            name="visitDate"
            value={formData.visitDate}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 "
          />
        </div>

          <div className="flex-1">
            <label className="block mb-1 font-medium">Visit Time From</label>
            <input
              type="time"
              name="visitTimeFrom"
              value={formData.visitTimeFrom}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 "
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">Visit Time To</label>
            <input
              type="time"
              name="visitTimeTo"
              value={formData.visitTimeTo}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <button type='submit'
        className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md hover:rounded hover:cursor-pointer '
        >Send Request</button>
      </form>
    </div>

  );
};

export default VisitRequest;
