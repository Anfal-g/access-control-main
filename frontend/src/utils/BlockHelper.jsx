import { useNavigate } from "react-router-dom"
import axios from "axios"

//array to define all we want in the dep table
export const columns =[
    {
      name: "S No"  ,
      selector: (row) => row.sno,
      width: "60px"
    }, //obj
    {
        name: "Name"  ,
        selector: (row) => row.name,
        sortable: true,
        width: "110px",
    },
    {
      name: "Type",
      selector: (row) => row.type ,
      width: "110px",
    },
    {
        name: "Reason",
        selector: (row) => row.reason ,
        width: "150px",
    },
    {
        name: "Blocked By",
        selector: (row) => row.blockedBy ,
        width: "150px",
    },
    {
        name: "From Date",
        selector: (row) => row.fromDate ,
        sortable: true,
        width: "110px",
    },
    {
        name: "From Time",
        selector: (row) => row.fromTime ,
        width: "110px",
    },
    {
        name: "To Date",
        selector: (row) => row.toDate ,
        sortable: true,
        width: "110px",
    },
    {
        name: "To Time",
        selector: (row) => row.toTime ,
        width: "110px",
    },
    {
        name: "Action"  ,
        selector: (row) => row.action,
        center: true
    },
]

export const BlockButtons = ({ Id, onUnblock }) => {
    const handleUnblock = async (id) => {
      const confirm = window.confirm("Do you want to unblock this resident?");
      if (confirm) {
        try {
          const response = await axios.delete(`http://localhost:5001/api/block/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
  
          if (response.data.success) {
            onUnblock(id); // remove from list
          }
        } catch (error) {
          console.log(error);
          if (error.response && !error.response.data.success) {
            alert(error.response.data.error);
          }
        }
      }
    };
  
    return (
      <button className="px-3 py-1 bg-green-600 text-white hover:rounded hover:cursor-pointer "
        onClick={() => handleUnblock(Id)}
      >
        Unblock
      </button>
    );
  };
  