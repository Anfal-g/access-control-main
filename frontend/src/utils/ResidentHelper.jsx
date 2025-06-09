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
        selector: (row) => row.name,
        sortable: true,
        width: "140px"
    },
    {
      name: "Image"  ,
      selector: (row) => row.profileImage,
      width: "90px"
    },
    {
      name: "Contact Info",
      selector: (row) => (
        <div className="flex flex-col">
          <span>{row.phone}</span>
          <span>{row.email}</span>
        </div>
      ),
      // sortable: true,
      width: "200px"
    },
    {
      name: "Apartments"  ,
      selector: (row) => row.apartment_name,
      width: "120px",
      sortable: true,
    },
    {
      name: "Type"  ,
      selector: (row) => row.residentType,
      width: "120px",
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (
        <span
          className={`px-2 py-1 rounded-full font-semibold ${
            row.status === "Blocked" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
          }`}
        >
          {row.status || "Unknown"}
        </span>
      ),
      width: "120px",
      // sortable: true,
    },    

    {
        name: "Action"  ,
        selector: (row) => row.action,
        center: true
    },
]

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

export const getResidents= async (id) => {
  let residents
  try {
    const response = await axios.get(`http://localhost:5001/api/resident/apartments/${id}`,{
      headers:{
        "Authorization": `Bearer ${localStorage.getItem('token')}`
      }
    })
    if(response.data.success){
      residents = response.data.residents
    }
  } catch (error) {
    if(error.response && !error.response.data.success){
      alert(error.response.data.error)
  }
  } 
  return residents
};

export const ResidentButtons =({Id,onResidentDelete,status, onUnblock})=>{
    const navigate = useNavigate()

    const handleDelete = async (id) => {
      const confirm = window.confirm("Do you want to delete this resident?");
      if (confirm) {
          try {
              console.log("Deleting resident with ID:", id);
              const response = await axios.delete(`http://localhost:5001/api/resident/${id}`, {
                  headers: {
                      "Authorization": `Bearer ${localStorage.getItem('token')}`
                  }
              });
  
              if(response.data.success){
                  alert("Resident deleted successfully");
                  onResidentDelete(id); // Update the UI
              }
          } catch (error) {
              console.error("Delete error:", error);
              alert(error.response?.data?.error || "Failed to delete resident");
          }
      }
  };

    const handleUnblock = async (id) => {
      console.log("Unblock ID:", id);
      const confirm = window.confirm("Do you want to unblock this resident?");
      if (confirm) {
        try {
          const response = await axios.delete(`http://localhost:5001/api/resident/unblock/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          console.log("Unblock response:", response.data);
  
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

    return(
        <div className="flex space-x-3">
            {/* <button className="px-3 py-1 bg-teal-600 text-white"
             onClick={()=>navigate(`/admin-dashboard/residents/${Id}`)}
              >View
            </button> */}
            <button className="px-3 py-1 bg-blue-600 text-white hover:rounded hover:cursor-pointer "
              onClick={() => navigate(`/admin-dashboard/residents/edit/${Id}`)}
              >Edit
            </button>
            <button className="px-3 py-1 bg-yellow-600 text-white hover:rounded hover:cursor-pointer "
              onClick={() => navigate(`/admin-dashboard/residents/visitors/${Id}`)}
              >List
            </button>
            <button className="px-3 py-1 bg-red-600 text-white hover:rounded hover:cursor-pointer "
              // onClick={() => navigate(`/admin-dashboard/residents/delete/${Id}`)}
              onClick={() => handleDelete(Id)}
              >Delete
            </button>

            {status === "Blocked" ? (
              <button className="px-3 py-1 bg-green-600 text-white hover:rounded hover:cursor-pointer " onClick={() => handleUnblock(Id)}>
                Unblock
              </button>
            ) : (
              <button
                className="px-3 py-1 bg-teal-600 text-white hover:rounded hover:cursor-pointer "
                onClick={() => navigate(`/admin-dashboard/residents/block/${Id}`)}
              >
                Block
              </button>
            )} 
            {/* <button className="px-3 py-1 bg-teal-600 text-white"
             onClick={()=>navigate(`/admin-dashboard/residents/block/${Id}`)}
              >Block
            </button> */}
        </div>
    )
} 