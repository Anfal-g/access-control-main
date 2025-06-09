import React, { useEffect, useState } from 'react'
import {Link} from 'react-router-dom'
import DataTable from 'react-data-table-component'
import {columns, ApartmentButtons} from '../../utils/ApartmentHelper.jsx'
import axios from 'axios'
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

const ApartementList = (req,res) => {
  const [apartments,setApartments]=useState([])
  const [aprtLoading,setAprtLoading]=useState(false)
  const [filteredApartments,setFilteredApartments]=useState([])
  const { darkMode } = usedarkMode();
  
  const onApartmentDelete =async (id) =>{
    fetchApartments()
  }

  const fetchApartments= async () => {
    setAprtLoading(true)
    try {
      const response = await axios.get("http://localhost:5001/api/apartment",{
        headers:{
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      })
      if(response.data.success){
        let sno=1
        //befor assing data to aprt we will create our data for data table
        const data =await response.data.apartments.map((aprt)=>(
          {
            //inside this function we will prepare the data
              _id:aprt._id,
              sno: sno++,
              apartment_name: aprt.apartment_name,
              totalResidents: aprt.totalResidents,
              owner: aprt.owner,
              action: (<ApartmentButtons Id={aprt._id} onApartmentDelete={onApartmentDelete}/>)
          } 
        ))
        //Apartments we will nae it in the server + map to go through all Apartments
        setApartments(data) 
        setFilteredApartments(data)
      }
    } catch (error) {
        console.log(error)
      if(error.response && !error.response.data.success){
        alert(error.response.data.error)
    }
    } finally{
      setAprtLoading(false)
    }
  };

  useEffect(()=>{ 

    fetchApartments() ;//to return data from server
  },[])//run at the start of compenants

  const filterApartments = (e) =>{
    //filter based on the name
    const records = apartments.filter((aprt) =>
    aprt.apartment_name.toLowerCase().includes(e.target.value.toLowerCase()))
    setFilteredApartments(records)
  }
  return (
    <>{aprtLoading ? <div> Loading ....</div> : 
  <div className='p-2 md:p-5'> {/* Reduced padding on mobile */}
    <div className='text-center mb-4'>
      <h3 className='text-xl md:text-2xl font-bold'>Manage Apartements</h3>
    </div>
    <div className='flex flex-col md:flex-row justify-between items-center gap-2 mb-4'>
      <input 
        type="text" 
        placeholder='Search By aprt name' 
        className='w-full md:w-auto px-3 py-1 border rounded'
        onChange={filterApartments}
      />
      <Link 
        to="/admin-dashboard/add-apartment" 
        className='w-full md:w-auto px-3 py-1 bg-teal-600 rounded text-white text-center'
      >
        Add New Apartement
      </Link>
    </div>
      <div className='mt-5'>
        {/* display aprt using react data table component library
        data inside  it has built an pation and sort functionalities 
        need to specify the colums in the data*/}
        
        
        <DataTable 
          columns={columns} 
          //data={apartments} 
          data={filteredApartments}   
          pagination  
          theme={darkMode ? 'solarized' : 'default'}
          noDataComponent="No Apartments found."
        />

      
      </div>
    </div>}</>
  )
}

export default ApartementList