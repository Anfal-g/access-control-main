import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { columns } from '../../utils/EntryLogsHelper.jsx'
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

const EntryLogs = () => {
  const [entryLogs, setEntryLogs] = useState([])
  const [filteredEntryLogs, setFilteredEntryLogs] = useState([])
  const [entryLoading, setEntryLoading] = useState(false)
  const { darkMode } = usedarkMode();

  // Filter states
  const [nameFilter, setNameFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [timeFilter, setTimeFilter] = useState('')

  const fetchEntryLogs = async () => {
    setEntryLoading(true);
    try {
      const response = await axios.get("http://localhost:5001/api/scanner", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (response.data.success) {
        let sno = 1;
        const data = response.data.entryLogs.map((entry) => {
          const isResidentEntry = entry.resident && entry.resident.userId;
          const isVisitorEntry = entry.visitor;
          const isRequestEntry = entry.visitRequest;

          console.log("Entry:", entry);
          // console.log("Is Resident Entry:", isResidentEntry);
          // console.log("Is Visitor Entry:", isVisitorEntry);
          // console.log("Is Request visitorName :", isRequestEntry.visitorName);
          console.log("Is Request targetResident :", entry.visitRequest?.targetResident?.userId?.name);
          console.log("Is Request visitorName :", entry.visitRequest?.visitorName);

  
          const name = isResidentEntry
            ? entry.resident.userId.name
            : isVisitorEntry
            ? entry.visitor.fullName
            : isRequestEntry
            ? entry.visitRequest.visitorName
            : 'N/A';
  
            const apartment = isResidentEntry
            ? entry.resident.apartment?.apartment_name
            : isVisitorEntry
            ? entry.visitor.resident?.apartment?.apartment_name
            : isRequestEntry
            ? entry.visitRequest.targetResident?.apartment?.apartment_name
            : 'N/A';          
  
          const profileImage = isResidentEntry
            ? entry.resident.userId.profileImage
              ? (
                <img
                  width={40}
                  className="rounded-full"
                  src={`http://localhost:5001/${entry.resident.userId.profileImage}`}
                  alt="Profile"
                />
              ) : 'N/A'
            // : 'Visitor'
            : <img
                src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
                alt="Request"
                // className="rounded-full border-2 border-teal-500 w-40 h-15 object-cover"
                width={40}
                className="rounded-full "
              />
            
            
          
          return {
            _id: entry._id,
            sno: sno++,
            resident_name: name,
            profileImage: profileImage,
            resident_apartment: apartment,
            type: entry.type,
            typeOfUser: entry.resident ? "Resident" : entry.visitor ? "Visitor" : entry.visitRequest ? "Visitor": "N/A",
            scan_date: entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : "N/A",
            scan_time: entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : "N/A",
          };
        });
  
        setEntryLogs(data);
        setFilteredEntryLogs(data);
      }
    } catch (error) {
      console.log(error);
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    } finally {
      setEntryLoading(false);
    }
  };
  

  // Filter logic
  useEffect(() => {
    const filtered = entryLogs.filter(entry =>
      (entry.resident_name?.toLowerCase() || '').includes(nameFilter.toLowerCase()) &&
      (dateFilter === '' || entry.scan_date === dateFilter) &&
      (timeFilter === '' || entry.scan_time.startsWith(timeFilter))
    )
    
    setFilteredEntryLogs(filtered)
  }, [nameFilter, dateFilter, timeFilter, entryLogs])

  useEffect(() => {
    fetchEntryLogs()
  }, [])

  return (
    <>
      {entryLoading ? (
        <div>Loading ....</div>
      ) : (
        <div className='p-5'>
          <div className='text-center'>
            <h3 className='text-2xl font-bold'>Manage EntryLogs</h3>
          </div>

          <div className="mt-4 ">
            {/* <div className="bg-gray-100 p-4 rounded-lg shadow-sm"> */}
            <div className="bg-white p-4 rounded-lg shadow-sm dark:bg-gray-800 dark:text-white">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Name Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1 dark:text-white">Resident Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onChange={(e) => setNameFilter(e.target.value)}
                  />
                </div>

                {/* Date Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1 dark:text-white">Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>

                {/* Time Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1 dark:text-white">Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onChange={(e) => setTimeFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>


          <div className='mt-5'>
            <DataTable
              columns={columns}
              data={filteredEntryLogs}
              pagination
              theme={darkMode ? 'solarized' : 'default'}
              noDataComponent="No EntryLogs found."
            />
          </div>
        </div>
      )}
    </>
  )
}

export default EntryLogs
