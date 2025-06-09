import React, { useEffect, useState } from 'react'
import { fetchApartments } from '../../utils/ResidentHelper.jsx'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import { FaArrowLeft } from "react-icons/fa";

const Add = () => {
  const [apartments ,setApartments] = useState([])
  const [formData ,setFormData] = useState({}) //objt to store data form data bcs we have file
  const Navigate = useNavigate()
  // const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(()=>{ 
    const getApartments = async () => {
      const apartments = await fetchApartments()
      setApartments(apartments)
    }
    getApartments()
  },[])

  const handleChange = (e) => {
    const { name, value, files } = e.target;
  
    if (files) {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
    console.log("Form Data before submission:", formData);

  };
  

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
  
    setErrorMessage(''); // Clear previous error messages before submitting
    // setSuccessMessage(''); // Optionally clear success message
  
    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key]);
    });
  
    try {
      // Make POST request to the server
      const response = await axios.post('http://localhost:5001/api/resident/add',formDataObj,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
  
      if (response.data.success) {
        // On success, clear error messages and navigate
        setErrorMessage('');
        Navigate("/admin-dashboard/residents");
      }
    } catch (error) {
      console.log(error);
      // Ensure error message is updated
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } 
      // else {
      //   setErrorMessage("An unexpected error occurred.");
      // }
    }
  };
  
  

  return (
    <div className='max-w-4xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md dark:bg-gray-800 dark:text-white'>
      <button onClick={() => Navigate(-1)}
        className="flex items-center text-teal-600 hover:text-teal-800 mb-4"
      >
        <FaArrowLeft className="mr-2" />
        Back
      </button>
      <h2 className='text-2xl font-bold mb-6'>Add New Resident</h2>
      {/* {successMessage && <div className="bg-green-100 text-green-800 p-3 mb-4 rounded">{successMessage}</div>} */}
      {errorMessage && <div className="bg-red-100 text-red-800 p-3 mb-4 rounded">{errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Name</label>
            <input type="text" name="name" placeholder='Insert Name'
            className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
            required 
            onChange={handleChange}
            />
          </div>
          {/* Email */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Email</label>
            <input type="email" name="email" placeholder='Insert Email'
            className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
            onChange={handleChange}
            required />
          </div>
          {/* Date of Birth */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Phone</label>
            <input type="tel" name="phone" placeholder='Phone'
            className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
            onChange={handleChange} required />
          </div>
          {/* Gender */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Gender</label>
            <select name="gender" className='mt-1 p-2 block w-full border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white'
              onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              {/* <option value="other">Other</option> */}
            </select>
          </div>
          {/* Marital Status */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Marital Status</label>
            <select name="maritalStatus" className='mt-1 p-2 block w-full border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white'
              placeholder="Marital Status"
              onChange={handleChange} required>
              <option value="">Select Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
            </select>
          </div>
          {/* Marital Status */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Resident Type</label>
            <select name="residentType" className='mt-1 p-2 block w-full border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white'
              placeholder="Resident Type"
              onChange={handleChange} required>
              <option value="">Select Resident Type</option>
              <option value="owner">Owner</option>
              <option value="family">Family Member</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Apartment</label>
            <select type="text" name="apartment" 
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white'
              onChange={handleChange} required >
              <option value="">Select Apartment</option>
              {apartments.map(aprt =>(
                <option key={aprt._id} value={aprt._id}> {aprt.apartment_name}</option>
              ))}
            </select>
          </div>
          {/* password */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Password</label>
            <input type="password" name="password" placeholder='**********'
            className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
            onChange={handleChange} required />
          </div>

          {/* image upload */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Upload Image</label>
            <input type="file" name="image" placeholder='Upload Image'
            accept='image/*'
            className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
            onChange={handleChange} required />
          </div>
        </div>
        <button type='submit'
        className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md hover:rounded hover:cursor-pointer '
        >Add Resident</button>
      </form>
    </div>
  )
}

export default Add