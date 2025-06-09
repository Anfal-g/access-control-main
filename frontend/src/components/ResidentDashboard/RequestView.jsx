import React ,{ useState, useEffect} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { FaArrowLeft } from 'react-icons/fa'

const RequestView = () => {
    const {id} =useParams() //to get id from url
    const [request,setRequest]=useState(null)
    const [resLoading,setResLoading]=useState(false)
    const Navigate = useNavigate()

    //fetch record based on this ID
    useEffect(()=>{
       setResLoading(true)
         console.log("id",id) 
        const fetchRequest= async () => {
          try {
            const response = await axios.get(`http://localhost:5001/api/request/view/${id}`,{
              headers:{
                "Authorization": `Bearer ${localStorage.getItem('token')}`
              }
            })
            console.log("response data",response.data)
            if(response.data.success){
                setRequest(response.data.request)
            }
          } catch (error) {
            console.error("Error fetching request:", error);
            if(error.response && !error.response.data.success){
              alert(error.response.data.error)
          }
          } 
        };
        fetchRequest() ;//to return data from server
      },[])//run at the start of compenants
    
      return (
        <>
          {request ? (
            <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-lg dark:bg-gray-800 dark:text-white">
              <button
                onClick={() => Navigate(-1)}
                className="flex items-center text-teal-600 hover:text-teal-800 mb-6 transition"
              >
                <FaArrowLeft className="mr-2" />
                Back
              </button>
    
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-10 dark:text-white">Request Details</h2>
    
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                <div className="flex justify-center">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
                  alt="Request"
                  className="rounded-full border-4 border-teal-500 w-72 h-72 object-cover"
                />

                </div>
                <div className="space-y-4 text-gray-700 dark:text-white">
                  <Detail label="Visitor Name" value={request.visitorName} />
                  <Detail label="Visitor Phone" value={request.visitorPhone} />
                  <Detail label="Request type" value={request.type} />
                  <Detail label="Visit Purpose" value={request.visitPurpose} />
                  <Detail label="Reason" value={request.customReason} />
                  <Detail label="Time From" value={request.visitTimeFrom} />
                  <Detail label="Time To" value={request.visitTimeTo} />
                  <Detail label="Status" value={request.status} />
                  <Detail
                    label="Send AT"
                    value={new Date(request.createdAt).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  />

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

export default RequestView