import React, { useEffect, useState } from 'react'
import SummaryCard from '../dashboard/SummaryCard'
import { FaBuilding, FaCheckCircle, FaFacebookMessenger, FaFileAlt, FaHourglassHalf, FaMoneyBillWave, FaTimesCircle, FaUsers } from 'react-icons/fa'
import axios from 'axios' 

export const AdminSummary = () => {
  const [summary, setSummary] = useState(null)
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/dashboard/summary', {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });
        setSummary(response.data); // Make sure to use response.data
      } catch (error) {
        console.log(error.message);
        if (error.response) {
          alert(error.response.data.error);
        }
      }
    };
    
    fetchSummary();
  }, []);
  

  if(!summary){
    return <div>Loading ...</div>
  }
  return (
    <div className='grow p-8'>
        <h3 className='ttext-2xl mb-4'>Dashboard Overview</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
            <SummaryCard icon={<FaUsers/>} text="Total Users"
              number={summary.totalResidents} color='bg-teal-600'/>
            <SummaryCard icon={<FaBuilding/>} text="Total Apartement" 
              number={summary.totalApartments} color='bg-yellow-600'/>
            <SummaryCard icon={<FaFacebookMessenger/>} text="Total Messages" 
              number={summary.totalMessages} color='bg-red-600'/>
        </div>

        {/* <div className='mt-12'>
            <h3 className='text-center text-2xl font-bold'>Leave Details</h3>
            <div className='grid grid-cols md:grid-cols-2 gap-6 mt-6'>
                <SummaryCard icon={<FaFileAlt/>} text="Leave applied" number={summary.leaveSummary.appliedFor } color='bg-teal-600'/>
                <SummaryCard icon={<FaCheckCircle/>} text="leave approved" number={summary.leaveSummary.approved } color='bg-yellow-600'/>
                <SummaryCard icon={<FaHourglassHalf/>} text="Leave pending" number={summary.leaveSummary.pending } color='bg-teal-600'/>
                <SummaryCard icon={<FaTimesCircle/>} text="Keave Rejected" number={summary.leaveSummary.rejected } color='bg-red-600'/>
            </div>
        </div> */}
    </div>

    
  )
}

export default AdminSummary