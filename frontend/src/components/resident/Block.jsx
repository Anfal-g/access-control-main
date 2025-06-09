import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft } from "react-icons/fa"

const Block = () => {
  const [resident, setResident] = useState({
    name: '',
    residentType: '',
  })
  const [formData, setFormData] = useState({
    reason: '',
    from: '',
    fromTime: '',
    to: '',
    toTime: ''
  })
  const { id } = useParams()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchResident = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/resident/${id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.data.success) {
          const resident = response.data.resident
          setResident({
            name: resident.userId.name,
            residentType: resident.residentType,
          })
        }
      } catch (error) {
        console.error("Error fetching resident:", error)
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error)
        }
      }
    }
    fetchResident()
  }, [id])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`http://localhost:5001/api/resident/block/${id}`, formData, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
          // "Content-Type": "application/json"
        }
      })
      if (response.data.success) {
        setSuccessMessage("Resident blocked successfully!")
        setErrorMessage('')
      }
    } catch (error) {
      console.error("Block error:", error)
      if (error.response && error.response.data.error) {
        setErrorMessage(error.response.data.error)
      }
    }
  }

  return (
    <div className='max-w-4xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md dark:bg-gray-800 dark:text-white'>
      <button onClick={() => navigate(-1)} className="flex items-center text-teal-600 hover:text-teal-800 mb-4 hover:cursor-pointer ">
        <FaArrowLeft className="mr-2" /> Back
      </button>
      <h2 className='text-2xl font-bold mb-6'>Block Resident</h2>
      {successMessage && <div className="bg-green-100 text-green-800 p-3 mb-4 rounded">{successMessage}</div>}
      {errorMessage && <div className="bg-red-100 text-red-800 p-3 mb-4 rounded">{errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Name</label>
            <input type="text" name="name" value={resident.name} disabled
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md' />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Reason</label>
            <input type="text" name="reason" placeholder='Insert Reason'
              value={formData.reason} onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md' required />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>From Date</label>
            <input type="date" name="from" value={formData.from} onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md' required />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>From Time</label>
            <input type="time" name="fromTime" value={formData.fromTime} onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md' required />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>To Date</label>
            <input type="date" name="to" value={formData.to} onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md' required />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>To Time</label>
            <input type="time" name="toTime" value={formData.toTime} onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md' required />
          </div>
        </div>
        <button type='submit'
          className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md hover:rounded hover:cursor-pointer '>
          Block Resident
        </button>
      </form>
    </div>
  )
}

export default Block
