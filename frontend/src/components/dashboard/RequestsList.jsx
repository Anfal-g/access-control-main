import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { columns, RequestButtons } from '../../utils/RequestHelper.jsx';
import { useAuth } from '../../context/authContext'; // Import the authContext
import { useNavigate } from 'react-router-dom';
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
  const [requests, setRequests] = useState([]);
  const [resLoading, setResLoading] = useState(false);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const navigate = useNavigate();
  // Get the user and loading state from context
  const { user, loading } = useAuth();
  const { darkMode } = usedarkMode();
  
  // Check if the user is an admin
  const userRole = user ? user.role : null;
  console.log("User Role:", userRole);

  const onActionComplete = async (id) => {
    fetchRequests();
  };

  const fetchRequests = async () => {
    setResLoading(true);
    try {
      const response = await axios.get("http://localhost:5001/api/request/req", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log("🔵 API Response:", response.data);
      if (!response.data.success) {
        console.log("❌ ERREUR: response.success est FALSE !");
      }

      if (response.data.success) {
        let sno = 1;
        const data = await response.data.requests.map((res) => (
          {
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
            createdBy: res.createdBy.name,
            status: res.status,
            // Only display RequestButtons if user is NOT an admin
            action: userRole ==! "admin"
            ? <RequestButtons 
                Id={res._id} 
                onActionComplete={onActionComplete} 
                status={res.status} 
                userRole={userRole}
              />
            : <span className="text-gray-500 italic">No action</span>,
          
          }
        ));
        setRequests(data);
        console.log("Final Requests State:", requests);
        setFilteredRequests(data);
      }
    } catch (error) {
      console.error("❌ Error fetching Requests:", error);
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    } finally {
      setResLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleFilter = (e) => {
    const records = requests.filter((res) =>
      res.visitorName.toLowerCase().includes(e.target.value.toLowerCase()));
    setFilteredRequests(records);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='p-6'>
      <div className='text-center'>
        <h3 className='text-2xl font-bold'>Manage Requests</h3>
      </div>
      <div className='flex justify-between items-center'>
        <input type="text" placeholder='Search By Visitor Name'
          className='px-4 py-0.5 border'
          onChange={handleFilter}
        />
      </div>
      <div className='mt-6'>
        <DataTable
          columns={columns}
          data={filteredRequests}
          pagination
          theme={darkMode ? 'solarized' : 'default'}
          noDataComponent="No Requests found."
          onRowClicked={(row) => {
            navigate(`/admin-dashboard/requests/view/${row._id}`); 
          }}
          pointerOnHover
          highlightOnHover
        />
      </div>
    </div>
  );
}

export default RequestList;
