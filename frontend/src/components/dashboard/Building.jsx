import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Building = () => {
  const Navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    numberOfApartments: '',
    residentsPerApartment: '',
    maxVisitorsPerResident: ''
  });

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/building/get', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setFormData(res.data.building);
      } catch (error) {
        console.log("Fetch error", error);
      }
    };
    fetchBuilding();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('http://localhost:5001/api/building/update', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.data.success) {
        alert("Building updated successfully!");
        // Navigate("/admin-dashboard");
      }
    } catch (err) {
      console.log("Update error", err);
      alert("Error updating building.");
    }
  };

  return (
    <div className='max-w-2xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md dark:bg-gray-800 dark:text-white'>
      <h2 className='text-2xl font-bold mb-6'>General Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className='block text-sm font-medium '>Building Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md' />
          </div>

          <div>
            <label className='block text-sm font-medium '>Apartments Number</label>
            <input type="number" name="numberOfApartments" value={formData.numberOfApartments} onChange={handleChange} required
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md' />
          </div>

          <div>
            <label className='block text-sm font-medium '>Residents Number</label>
            <input type="number" name="residentsPerApartment" value={formData.residentsPerApartment} onChange={handleChange} required
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md' />
          </div>

          <div>
            <label className='block text-sm font-medium '>Visitors Number</label>
            <input type="number" name="maxVisitorsPerResident" value={formData.maxVisitorsPerResident} onChange={handleChange} required
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md' />
          </div>
        </div>

        <button type='submit' className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md hover:rounded hover:cursor-pointer '>
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Building;
