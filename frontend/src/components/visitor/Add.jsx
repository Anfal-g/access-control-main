import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import { FaArrowLeft } from "react-icons/fa";

const Add = () => {
  // const { id } = useParams();
  const [visitor ,setVisitor] = useState({
      fullName: '',
      phone:'',
      visitTimeFrom:'',
      visitTimeTo:'',
      relationship:'',
 })
  const Navigate = useNavigate()
  // const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange =(e)=>{
    const {name,value} =e.target;
    setVisitor({...visitor, [name] : value})
}

    const handleSubmit = async (e) => {
      e.preventDefault(); // Prevent default form submission
      setErrorMessage(''); // Clear previous error messages before submitting
      // setSuccessMessage(''); // Optionally clear success message
    
      try {
        // Make POST request to the server
        const response = await axios.post('http://localhost:5001/api/visitor/add',
            visitor,
          {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        console.log("Response from server:", response.data); // Log the response data
        if (response.data.success) {
          setSuccessMessage("visitor added successfully!")
          setErrorMessage('');
          // Navigate("/resident-dashboard/visitors");
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
          <h2 className='text-2xl font-bold mb-6'>Add New Visitor</h2>
          {successMessage && <div className="bg-green-100 text-green-800 p-3 mb-4 rounded">{successMessage}</div>}
          {errorMessage && <div className="bg-red-100 text-red-800 p-3 mb-4 rounded">{errorMessage}</div>}
          <form onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-white'>Name</label>
                <input type="text" name="fullName" placeholder='Insert Name'
                className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
                required 
                onChange={handleChange}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-white'>Phone</label>
                <input type="tel" name="phone" placeholder='Phone'
                className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
                onChange={handleChange} 
                required />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-white'>Visit Time From</label>
                <input type="time" name="visitTimeFrom"
                className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
                onChange={handleChange} 
                required />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-white'>Visit Time To</label>
                <input type="time" name="visitTimeTo" 
                className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
                onChange={handleChange} 
                required />
              </div>

              {/* <div>
                <label className='block text-sm font-medium text-gray-700'>Upload Image</label>
                <input type="file" name="image" placeholder='Upload Image'
                accept='image/*'
                className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
                // onChange={handleChange}
                 required />
              </div> */}
            </div>
            <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-white'>RelationShip</label>
                <input type="text" name="relationship" placeholder='Relation Ship'
                className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
                required 
                onChange={handleChange}
                />
            </div>
            <button type='submit'
            className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md hover:rounded hover:cursor-pointer '
            >Add Visitor</button>
          </form>
        </div>
  )
}

export default Add