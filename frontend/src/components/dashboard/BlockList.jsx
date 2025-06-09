import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { columns ,BlockButtons} from '../../utils/BlockHelper.jsx'
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

const BlockList = () => {
    const [blocks, setBlocks] = useState([]);
    const [Loading,setLoading]=useState(false)
    const [filteredBlocks,setFilteredBlocks]=useState([])
    const { darkMode } = usedarkMode();

    const onUnblock =async (id) =>{
        fetchBlocks()
    }
    const fetchBlocks= async () => {
        setLoading(true)
        try {
          const response = await axios.get("http://localhost:5001/api/block",{
            headers:{
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
          })
          if(response.data.success){
            let sno=1
            //befor assing data to block we will create our data for data table
            const data =await response.data.blocks.map((block)=>(
              {
                //inside this function we will prepare the data
                  _id:block._id,
                  sno: sno++,
                  name: block.resident?.userId?.name || block.visitor?.fullName || "N/A",
                  type: block.resident ? "Resident" : block.visitor ? "Visitor" : "N/A",
                  reason: block.reason,
                  blockedBy: block.blockedBy?.name || "N/A",
                  fromDate: block.fromDateTime ? new Date(block.fromDateTime).toLocaleDateString() : "N/A",
                  fromTime: block.fromDateTime ? new Date(block.fromDateTime).toLocaleTimeString() : "N/A",
                  toDate: block.toDateTime ? new Date(block.toDateTime).toLocaleDateString() : "N/A",
                  toTime: block.toDateTime ? new Date(block.toDateTime).toLocaleTimeString() : "N/A",
                                 
                  action: (<BlockButtons Id={block._id} onUnblock={onUnblock}/>)
              } 
            ))
            // console.log("##########",data)
            setBlocks(data) 
            setFilteredBlocks(data)
          }
        } catch (error) {
            console.log(error)
          if(error.response && !error.response.data.success){
            alert(error.response.data.error)
        }
        } finally{
            setLoading(false)
        }
    };

    useEffect(() => {
      fetchBlocks();
    }, []);
  
    // const handleBlockDelete = (id) => {
    //   setBlocks((prev) => prev.filter((block) => block.Id !== id));
    // };
    const handleFilter = (e) => {
      const keyword = e.target.value.toLowerCase();
      const filtered = blocks.filter((block) => 
        block.name.toLowerCase().includes(keyword) || 
        block.type.toLowerCase().includes(keyword)
      );
      setFilteredBlocks(filtered);
    };
    
  
    return (
        <>{Loading ? <div> Loading ....</div> : 
        <div className="p-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold">Manage Block List</h3>
          </div>
    
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search By Name"
              className="px-4 py-0.5 border"
              onChange={handleFilter}
            />
          </div>
    
          <div className="mt-6">
            <DataTable
              columns={columns}
              // data={blocks}
              data={filteredBlocks}
              pagination
              theme={darkMode ? 'solarized' : 'default'}
              noDataComponent="No blocked residents found."
            />
          </div>
        </div>}</>
      );
    };
    

export default BlockList