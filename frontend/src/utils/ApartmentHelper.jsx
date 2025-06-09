import { useNavigate } from "react-router-dom"
import axios from "axios"

//array to define all we want in the dep table
export const columns =[
    {
      name: "S No"  ,
      selector: (row) => row.sno
    }, //obj
    {
        name: "Apartment Name"  ,
        selector: (row) => row.apartment_name,
        sortable: true
    },
    {
        name: "Owner",
        selector: (row) => row.owner || "N/A",
    },
    {
        name: "Total Residents",
        selector: (row) => row.totalResidents
    },
    {
        name: "Action"  ,
        selector: (row) => row.action
    },
]

export const ApartmentButtons =({Id, onApartmentDelete})=>{
    const navigate = useNavigate()
    
    const handleDelete = async (id) =>{
        const confirm =window.confirm("Do you want to delete?")
        if(confirm){
            console.log("########",id);
            try {
                const response = await axios.delete(`http://localhost:5001/api/apartment/${id}`,{
                  headers:{
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                  }
                })
    
                if(response.data.success){
                    //setApartment(response.data.apartment)
                    //filter data after delete need to refresh the front end 
                    // onApartmentDelete(id)  
                    onApartmentDelete(id)  
                }
              } catch (error) {
                if(error.response && !error.response.data.success){
                  alert(error.response.data.error)
              }
              }
        }
    }     
    return(
        <div className="flex space-x-3">
            <button className="px-3 py-1 bg-teal-600 text-white hover:rounded hover:cursor-pointer "
                onClick={()=>navigate(`/admin-dashboard/apartment/${Id}`)}
            >Edit</button>
            <button className="px-3 py-1 bg-red-600 text-white hover:rounded hover:cursor-pointer "
                onClick={() => handleDelete(Id)}
            >Delete</button>
        </div>
    )
}