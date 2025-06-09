import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link } from 'react-router-dom'
// import {columns, ApartmentButtons} from '../../utils/ApartmentHelper.jsx'
import axios from 'axios'
import { columns ,ResidentButtons} from '../../utils/ResidentHelper.jsx'

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


function List() {
    const [residents,setResidents]=useState([])
    const [resLoading,setResLoading]=useState(false)
    const [filteredResidents,setFilteredResidents]=useState([])
    const { darkMode } = usedarkMode();

    
    const onResidentDelete =async (id) =>{
      fetchResidents()
    }

    const onUnblock = (id) => {
      // console.log(`✅ Unblocked visitor with ID: ${id}`);
      fetchResidents();
    };

    const fetchResidents= async () => {
      setResLoading(true)
      try {
        const response = await axios.get("http://localhost:5001/api/resident",{
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
          const data = await response.data.residents.map((res)=>(
            {
              //inside this function we will prepare the data
                _id: res._id,
                sno: sno++,
                apartment_name: res.apartment ? res.apartment.apartment_name : "N/A",
                name: res.userId.name, //this from DB
                email: res.userId.email, //this from DB
                phone: res.userId.phone,
                residentType: res.residentType,
                status: res.status, 
                profileImage: <img width={40} className="rounded-full" src={`http://localhost:5001/${res.userId.profileImage}`}  />,
                action: (<ResidentButtons 
                  Id={res._id} 
                  onResidentDelete={onResidentDelete}
                  status={res.status}
                  onUnblock={onUnblock}/>),
            } 
          ))
          //apartments we will nae it in the server + map to go through all apartments
          //console.log("****",sno);
          setResidents(data) 
          console.log("Final Residents State:", residents);
          setFilteredResidents(data)
        }
      } catch (error) {
        console.error("❌ Error fetching residents:", error);
        if(error.response && !error.response.data.success){
          alert(error.response.data.error)
      }
      } finally{
        setResLoading(false)
      }
    };

    useEffect(()=>{ 
      fetchResidents() ;//to return data from server
    },[])//run at the start of compenants

      const handleFilter = (e) =>{
        //filter based on the name
        const records = residents.filter((res) =>
          res.name.toLowerCase().includes(e.target.value.toLowerCase()))
        setFilteredResidents(records)
      }   
  return (
    <div className='p-6'>
      <div className='text-center'>
        <h3 className='text-2xl font-bold'>Manage Residents</h3>
      </div>
      <div className='flex justify-between items-center'>
        <input type="text" placeholder='Search By Res name' 
        className='px-4 py-0.5 border'
        onChange={handleFilter}
        />
        <Link to="/admin-dashboard/add-resident" 
        className='px-4 py-1 bg-teal-600 rounded text-white'>Add New Resident</Link>
      </div>
      <div className='mt-6'>
      <DataTable 
        columns={columns}
        data={filteredResidents}
        pagination  
        theme={darkMode ? 'solarized' : 'default'}
        noDataComponent="No Residents found."
        onRowClicked={(row) => {
          window.location.href = `/admin-dashboard/residents/${row._id}`
        }}
        pointerOnHover
        highlightOnHover
      />

      </div>
    </div>
  )
}

export default List