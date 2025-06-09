import React ,{ useState, useEffect} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { FaArrowLeft } from 'react-icons/fa'

const View = () => {
    const {id} =useParams() //to get id from url
    const [resident,setResident]=useState(null)
    const [resLoading,setResLoading]=useState(false)
    const Navigate = useNavigate()

    //fetch record based on this ID
    useEffect(()=>{
       // setResLoading(true)
        const fetchResident= async () => {
          try {
            const response = await axios.get(`http://localhost:5001/api/resident/${id}`,{
              headers:{
                "Authorization": `Bearer ${localStorage.getItem('token')}`
              }
            })
            console.log(response.data)
            if(response.data.success){
                setResident(response.data.resident)
            }
          } catch (error) {
            if(error.response && !error.response.data.success){
              alert(error.response.data.error)
          }
          } 
        };
        fetchResident() ;//to return data from server
      },[])//run at the start of compenants
    
      return (
        <>
          {resident ? (
            <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-lg dark:bg-gray-800 dark:text-white">
              <button
                onClick={() => Navigate(-1)}
                className="flex items-center text-teal-600 hover:text-teal-800 mb-6 transition hover:cursor-pointer "
              >
                <FaArrowLeft className="mr-2" />
                Back
              </button>
    
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-10 dark:text-white">Resident Details</h2>
    
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                <div className="flex justify-center">
                  <img
                    src={`http://localhost:5001/${resident.userId.profileImage}`}
                    alt="Resident"
                    className="rounded-full border-4 border-teal-500 w-72 h-72 object-cover"
                  />
                </div>
                <div className="space-y-4 text-gray-700 dark:text-white ">
                  <Detail label="Name" value={resident.userId.name} />
                  <Detail label="Resident ID" value={resident.residentId} />
                  <Detail label="Phone" value={resident.userId.phone} />
                  <Detail label="Gender" value={resident.gender} />
                  <Detail label="Apartment" value={resident.apartment.apartment_name} />
                  <Detail label="Marital Status" value={resident.maritalStatus} />
                  <Detail label="Resident Type" value={resident.residentType} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center mt-20 text-lg text-gray-500">Loading ...</div>
          )}
        </>
      )
}

const Detail = ({ label, value }) => (
  <div className="flex">
    <span className="w-40 font-semibold">{label}:</span>
    <span className="text-gray-900">{value}</span>
  </div>
)

export default View