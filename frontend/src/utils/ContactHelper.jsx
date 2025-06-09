import { useNavigate } from "react-router-dom"
import axios from "axios"

//array to define all we want in the dep table
export const columns =[
    {
      name: "S No"  ,
      selector: (row) => row.sno,
      width: "70px"
    }, //obj
    {
        name: "Resident Name"  ,
        selector: (row) => row.name,
        sortable: true,
        width: "150px"
    },
    // {
    //     name: "Email",
    //     selector: (row) => row.email,
    //     width: "150px"
    // },
    {
        name: "Subject",
        selector: (row) => row.subject,
        width: "120px"
    },
    {
        name: "Message",
        selector: (row) => row.message,
        
    },
    {
        name: "Status"  ,
        selector: (row) => row.isResolved,
        width: "120px"
    },
    {
        name: "Seen"  ,
        selector: (row) => row.seen,
        width: "120px"
    },
    {
        name: "Send At",
        selector: (row) => row.sentAt,
        width: "120px"
    },
    {
        name: "Action"  ,
        selector: (row) => row.action
    },
]

export const ContactButtons = ({ Id, onContactDelete, isResolved }) => {
    const navigate = useNavigate()
  
    const handleDelete = async (id) => {
      const confirm = window.confirm("Do you want to delete?")
      if (confirm) {
        try {
          const response = await axios.delete(`http://localhost:5001/api/contact/${id}`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
          })
  
          if (response.data.success) {
            onContactDelete(id)
          }
        } catch (error) {
          if (error.response && !error.response.data.success) {
            alert(error.response.data.error)
          }
        }
      }
    }
  
    return (
      <div className="flex space-x-3">
        <button
          className={`px-3 py-1 text-white ${isResolved ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:rounded hover:cursor-pointer '}`}
          disabled={isResolved}
          onClick={() => navigate(`/admin-dashboard/contact/reply/${Id}`)}
        >
          Reply
        </button>
        <button
          className="px-3 py-1 bg-red-600 text-white hover:rounded hover:cursor-pointer "
          onClick={() => handleDelete(Id)}
        >
          Delete
        </button>
      </div>
    )
  }
  