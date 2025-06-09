import axios from "axios"
import { useNavigate } from "react-router-dom"

export const columns =[
    {
      name: "S No"  ,
      selector: (row) => row.sno,
      width: "90px"
    }, 
    {
        name: "Name"  ,
        selector: (row) => row.name,
        sortable: true,
         width: "180px"
    },
    {
        name: "Phone"  ,
        selector: (row) => row.phone,
        width: "120px"
    },
    {
        name: "Relationship"  ,
        selector: (row) => row.relationship,
         width: "120px"
    },
    {
        name: "Time From"  ,
        selector: (row) => row.visitTimeFrom,
        sortable: true,
         width: "110px"
    },
    {
        name: "Time To",
        selector: (row) => row.visitTimeTo,
        width: "100px"
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
      width: "110px",
      // sortable: true,
    }, 
    {
        name: "Action"  ,
        selector: (row) => row.action,
        center: true
    },

]

export const VisitorButtons = ({ Id, status, onVisitorDelete, onUnblock, userRole }) => {
  const navigate = useNavigate();
  console.log("VisitorButtons", Id, status, onVisitorDelete, onUnblock, userRole);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Do you want to delete?");
    if (confirm) {
      try {
        const response = await axios.delete(`http://localhost:5001/api/visitor/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          onVisitorDelete(id);
        }
      } catch (error) {
        console.log(error);
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    }
  };

  const handleUnblock = async (id) => {
    const confirm = window.confirm("Do you want to unblock this visitor?");
    if (confirm) {
      try {
        const response = await axios.delete(`http://localhost:5001/api/visitor/unblock/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          onUnblock(id);
        }
      } catch (error) {
        console.log(error);
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    }
  };

  const handleBlock = (id) => {
    if (userRole === "admin") {
      navigate(`/admin-dashboard/visitors/block/${id}`);
    } else {
      navigate(`/resident-dashboard/visitors/block/${id}`);
    }
  };
  const handleEdit = (id) => {
    if (userRole === "admin") {
      navigate(`/admin-dashboard/visitors/edit/${id}`);
    } else {
      navigate(`/resident-dashboard/visitors/edit/${id}`);
    }
  };
  return (
    <div className="flex space-x-3">
      <button className="px-3 py-1 bg-blue-600 text-whitehover:rounded hover:cursor-pointer "
       onClick={() => handleEdit(Id)}>
        Edit
      </button>

      <button className="px-3 py-1 bg-red-600 text-white hover:rounded hover:cursor-pointer " 
      onClick={() => handleDelete(Id)}>
        Delete
      </button>

      {status === "Blocked" ? (
        <button className="px-3 py-1 bg-green-600 text-white hover:rounded hover:cursor-pointer " 
        onClick={() => handleUnblock(Id)}>
          Unblock
        </button>
      ) : (
        <button className="px-3 py-1 bg-teal-600 text-white hover:rounded hover:cursor-pointer " 
        onClick={() => handleBlock(Id)}>
          Block
        </button>
      )}
    </div>
  );
};

