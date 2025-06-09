import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { columns, VisitorButtons } from '../../utils/VisitorHelper.jsx'
import { useAuth } from '../../context/authContext'
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

const List = () => {
  const [visitors, setVisitors] = useState([])
  const [Loading, setLoading] = useState(false)
  const [filteredVisitors, setFilteredVisitors] = useState([])
  const { user } = useAuth()
  const { id } = useParams();
  const { darkMode } = usedarkMode();

  const onVisitorDelete = async (id) => {
    fetchVisitors()
  }

  const onUnblock = (id) => {
    fetchVisitors();
  };

  const fetchVisitors = async () => {
    setLoading(true)
    // console.log("🔵 Fetching visitors for resident ID:", id);
    try {
      const response = await axios.get(`http://localhost:5001/api/visitor/admin/${id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      })
      // console.log("🔵 API Response:", response.data);
      if (!response.data.success) {
        console.log("❌ ERREUR: response.success est FALSE !");
      }

      if (response.data.success) {
        let sno = 1;
        const data = response.data.visitors.map((vis) => ({
          _id: vis._id,
          sno: sno++,
          name: vis.fullName,
          phone: vis.phone,
          relationship: vis.relationship,
          visitTimeFrom: vis.visitTimeFrom,
          visitTimeTo: vis.visitTimeTo,
          status: vis.status,
          action: (
            <VisitorButtons
              Id={vis._id}
              status={vis.status}
              onVisitorDelete={onVisitorDelete}
              onUnblock={onUnblock}
              userRole={user?.role} // Pass user role here
            />
          )
        }))
        // console.log("🔵 Visitors data:", data);
        setVisitors(data)
        setFilteredVisitors(data)
      }
    } catch (error) {
      // console.error("❌ Error fetching Visitors:", error);
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error)
      }
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [])

  const handleFilter = (e) => {
    const records = visitors.filter((res) =>
      res.name.toLowerCase().includes(e.target.value.toLowerCase()))
    setFilteredVisitors(records)
  }

  return (
    <div className='p-6'>
      <div className='text-center'>
        <h3 className='text-2xl font-bold'>Manage Visitors</h3>
      </div>
      <div className='flex justify-between items-center'>
        <input
          type="text"
          placeholder='Search By Visitor name'
          className='px-4 py-0.5 border'
          onChange={handleFilter}
        />
        <Link
          to={`/admin-dashboard/residents/${id}/add-visitor`}
          className='px-4 py-1 bg-teal-600 rounded text-white'>
          Add New Visitor
        </Link>
      </div>
      <div className='mt-6'>
        <DataTable
          columns={columns}
          data={filteredVisitors}
          pagination
          theme={darkMode ? 'solarized' : 'default'}
          noDataComponent="No Visitors found."
        />
      </div>
    </div>
  )
}

export default List
