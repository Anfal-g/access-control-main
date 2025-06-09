import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { columns ,RequestButtons} from '../../utils/RequestHelper.jsx'
import { createTheme } from 'react-data-table-component';
import { usedarkMode } from '../../context/ThemeContext.jsx'; // or correct path

createTheme('solarized', {
  text: {
    primary: '#ffffff',
    secondary: '#cccccc',
  },
  background: {
    default: '#1f2937', // Tailwind dark bg: gray-800
  },
  context: {
    background: '#cb4b16',
    text: '#FFFFFF',
  },
  divider: {
    default: '#444444',
  },
  button: {
    default: '#ffffff',
    // hover: 'rgba(255,255,255,0.1)',
    focus: 'rgba(255,255,255,0.2)',
    disabled: 'rgba(255,255,255,0.3)',
  },
}, 'dark');

function RequestList() {
    const [requests,setRequests]=useState([])
    const [resLoading,setResLoading]=useState(false)
    const [filteredRequests,setFilteredRequests]=useState([])
    const { darkMode } = usedarkMode();
    
    const onActionComplete =async (id) =>{
      fetchRequests()
    }

    // const onUnblock = (id) => {
    //   // console.log(`✅ Unblocked visitor with ID: ${id}`);
    //   fetchRequests();
    // };

    const fetchRequests= async () => {
      setResLoading(true)
      try {
        const response = await axios.get("http://localhost:5001/api/request",{
          headers:{
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        })
        console.log("🔵 API Response:", response.data);
        if (!response.data.success) {
          console.log("❌ ERREUR: response.success est FALSE !");
        }

        if(response.data.success){
          let sno=1;
          //console.log(sno);
          //befor assing data to dep we will create our data for data table
          const data = await response.data.requests.map((res)=>(
            {
              //inside this function we will prepare the data
                _id: res._id,
                sno: sno++,
                visitorName: res.visitorName || "N/A",
                visitorPhone: res.visitorPhone || "N/A",    
                type: res.type || "N/A",
                visitPurpose: res.visitPurpose || "N/A",
                customReason: res.customReason || "N/A",
                visitTimeFrom: res.visitTimeFrom || "N/A",
                visitTimeTo: res.visitTimeTo || "N/A",
                createdAt: new Date(res.createdAt).toLocaleDateString("en-US"),
                createdBy: res.createdBy.name, //this from DB
                status:res.status,
                 action: (<RequestButtons 
                  Id={res._id} 
                  onActionComplete={onActionComplete}
                //   onRequestDelete={onRequestDelete}
                  status={res.status}
                //   onUnblock={onUnblock}
                  />),
            } 
          ))
          setRequests(data) 
          console.log("Final Requests State:", requests);
          setFilteredRequests(data)
        }
      } catch (error) {
        console.error("❌ Error fetching Requests:", error);
        if(error.response && !error.response.data.success){
          alert(error.response.data.error)
      }
      } finally{
        setResLoading(false)
      }
    };

    useEffect(()=>{ 
      fetchRequests() ;
    },[])

      const handleFilter = (e) =>{
        const records = requests.filter((res) =>
          res.name.toLowerCase().includes(e.target.value.toLowerCase()))
        setFilteredRequests(records)
      }   
  return (
    <div className='p-6'>
      <div className='text-center'>
        <h3 className='text-2xl font-bold'>Manage Requests</h3>
      </div>
      <div className='flex justify-between items-center'>
        <input type="text" placeholder='Search By Res name' 
        className='px-4 py-0.5 border'
        onChange={handleFilter}
        />
        {/* <Link to="/admin-dashboard/add-request" 
        className='px-4 py-1 bg-teal-600 rounded text-white'>Add New Request</Link> */}
      </div>
      <div className='mt-6'>
        <DataTable 
          columns={columns}
          data={filteredRequests}
          pagination  
          theme={darkMode ? 'solarized' : 'default'}
          noDataComponent="No Requests found."
          onRowClicked={(row) => {
            window.location.href = `/resident-dashboard/requests/view/${row._id}`
          }}
          pointerOnHover
          highlightOnHover
        />

      </div>
    </div>
  )
}

export default RequestList