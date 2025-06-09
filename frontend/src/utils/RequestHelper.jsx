import axios from "axios";
import { useNavigate } from "react-router-dom";

export const columns =[
    {
      name: "S No"  ,
      selector: (row) => row.sno,
      width: "60px"
    }, //obj
    {
        name: "Name"  ,
        selector: (row) => row.visitorName,
        sortable: true,
        width: "140px"
    },
    // {
    //   name: "Phone"  ,
    //   selector: (row) => row.visitorPhone,
    //   width: "110px"
    // },
    {
      name: "type"  ,
      selector: (row) => row.type,
      width: "100px",
      sortable: true,
    },
    {
      name: "Purpose"  ,
      selector: (row) => row.visitPurpose,
      width: "120px",
      sortable: true,
    },  
    {
      name: "Reason"  ,
      selector: (row) => row.customReason,
      width: "120px",
      sortable: true,
    },  
    {
      name: "TimeFrom"  ,
      selector: (row) => row.visitTimeFrom,
      width: "120px",
      sortable: true,
    },  
    {
      name: "TimeTo"  ,
      selector: (row) => row.visitTimeTo,
      width: "120px",
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => {
        let statusClass = "";
    
        switch (row.status?.toLowerCase()) {
          case "pending":
            statusClass = "bg-blue-100 text-blue-800";
            break;
          case "accepted":
            statusClass = "bg-green-100 text-green-800";
            break;
          case "rejected":
            statusClass = "bg-red-100 text-red-800";
            break;
          default:
            statusClass = "bg-gray-100 text-gray-800";
        }
    
        return (
          <span className={`px-2 py-1 rounded-full font-semibold ${statusClass}`}>
            {row.status || "Unknown"}
          </span>
        );
      },
      width: "120px",
      // sortable: true,
    },
    // {
    //   name: "Created At"  ,
    //   selector: (row) => row.createdAt,
    //   width: "120px",
    //   sortable: true,
    // },  
    {
        name: "Action"  ,
        selector: (row) => row.action,
        center: true
    },
]

export const getResidents = async (apartmentId) => {
  try {
    const response = await axios.get(`http://localhost:5001/api/residents?apartmentId=${apartmentId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.data.success) {
      return response.data.residents; // assuming the API returns the residents list under 'residents'
    }
  } catch (err) {
    console.error("Failed to fetch residents:", err);
    return [];
  }
};


export const fetchApartments= async () => {
  let apartments
  try {
    const response = await axios.get("http://localhost:5001/api/apartment",{
      headers:{
        "Authorization": `Bearer ${localStorage.getItem('token')}`
      }
    })
    if(response.data.success){
      apartments = response.data.apartments
    }
  } catch (error) {
    console.log(error)
    if(error.response && !error.response.data.success){
      alert(error.response.data.error)
  }
  } 
  return apartments
};

export const RequestButtons = ({ Id, status, onActionComplete ,userRole}) => {
  console.log("RequestButtons Rendered with Id:", Id, "and status:", status);
  const isDisabled = status?.toLowerCase() !== "pending";

  const handleStatusChange = async (newStatus) => {
    if (isDisabled) return; // prevent double clicks or further actions

    try {
      const response = await axios.patch(
        `http://localhost:5001/api/request/${Id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        onActionComplete(); // Refresh the parent or table
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while updating status.");
    }
  };

  return (
    <div className="flex space-x-3">
      <button
        className="px-3 py-1 bg-green-600 text-white disabled:opacity-50 hover:rounded hover:cursor-pointer "
        onClick={() => handleStatusChange("accepted")}
        disabled={isDisabled}
      >
        Accept
      </button>
      <button
        className="px-3 py-1 bg-red-600 text-white disabled:opacity-50 hover:rounded hover:cursor-pointer "
        onClick={() => handleStatusChange("rejected")}
        disabled={isDisabled}
      >
        Reject
      </button>
    </div>
  );
};

