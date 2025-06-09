import React, { useEffect, useState } from 'react'
import { fetchApartments } from '../../utils/ResidentHelper'
import axios from 'axios'
import {useNavigate, useParams} from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'


const Edit = () => {
  const [resident ,setResident] = useState({
    name:'',
    maritalStatus:'',
    apartment:''
  })
  const [apartments ,setApartments] = useState(null)
  const Navigate = useNavigate()
  const {id} = useParams();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(()=>{ 
    const getApartments = async () => {
      const apartments = await fetchApartments()
      setApartments(apartments)
    }
    getApartments()
  },[])

  useEffect(()=>{ 
    const fetchResident= async () => {
        try {
          const response = await axios.get(`http://localhost:5001/api/resident/${id}`,{
            headers:{
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
          })

          if(response.data.success){
            const resident = response.data.resident
            setResident((prev) => ({
              ...prev,
              name: resident.userId.name,
              maritalStatus: resident.maritalStatus,
              residentType: resident.residentType,  // ✅ add this
              apartment: resident.apartment._id,
            }));
            
          }
        } catch (error) {
          console.error("❌Edit resident FIle Error fetching residents:", error);
          if(error.response && !error.response.data.success){
            alert(error.response.data.error)
        }
        } 
      };
    fetchResident()
  },[])

  // const handleChange = (e) =>{
  //   const {name, value, files} = e.target
  //   if(name ==="image"){
  //     setFormData((prevData) => ({...prevData, [name] : files[0]}))
  //   }else{
  //     //name is not objt
  //     setFormData((prevData) => ({...prevData, [name] : value}))
  //   }
  // }

  const handleChange = (e) => {
    const { name, value } = e.target;
     setResident((prevData) => ({ ...prevData, [name]: value }));
    //console.log("Form Data before submission:", formData);

  };
  

  const handleSubmit = async(e)=>{
    e.preventDefault()  //refresh again and again when we run app
    setErrorMessage(''); 

    try {
        //console.log("Updating Resident with ID:", id);
        //pass data to server 
        const response = await axios.put(`http://localhost:5001/api/resident/${id}`, 
          resident,{
            headers:{
                //prefix the bearre with token ,, we will pass the token to check it is for admin or not
                "Authorization": `Bearer ${localStorage.getItem('token')}` //pass it with request
            }
        })
        // console.log("🔵 API Response:", response.data);
        if (!response.data.success) {
          // console.log("❌ ERREUR: response.success est FALSE !");
        }
        // console.log("Updating resident with ID:", id);

         if(response.data.success){
          setErrorMessage('');
            Navigate("/admin-dashboard/residents")
         }
    } catch (error) {
        console.error("❌Edit resident FIle Error:", error);
        if (error.response && error.response.data && error.response.data.error) {
          setErrorMessage(error.response.data.error);
        } 
    }
  }

  return (
    <>{apartments && resident ? (
    <div className='max-w-4xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md dark:bg-gray-800 dark:text-white'>
      <button onClick={() => Navigate(-1)}
        className="flex items-center text-teal-600 hover:text-teal-800 mb-4 hover:cursor-pointer "
      >
        <FaArrowLeft className="mr-2" />
        Back
      </button>
      <h2 className='text-2xl font-bold mb-6'>Edit Resident</h2>
      {errorMessage && <div className="bg-red-100 text-red-800 p-3 mb-4 rounded">{errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Name</label>
            <input type="text" name="name"
             value={resident.name}
             placeholder='Insert Name'
             className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
             required 
             onChange={handleChange}
            />
          </div>

          {/* Marital Status */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Marital Status</label>
            <select name="maritalStatus" className='mt-1 p-2 block w-full border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white'
              value={resident.maritalStatus}
              placeholder="Marital Status"
              onChange={handleChange} required>
              <option value="">Select Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
            </select>
          </div>
          {/* Marital Status */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Resident Type</label>
            <select name="residentType" className='mt-1 p-2 block w-full border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white'
              value={resident.residentType}
              placeholder="Resident Type"
              onChange={handleChange} required>
              <option value="">Select Resident Type</option>
              <option value="owner">Owner</option>
              <option value="family">Family Member</option>
            </select>
          </div>

          {/* apartment   className='col-span-2' */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Apartment</label>
            <select type="text" name="apartment" 
              value={resident.apartment}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white'
              onChange={handleChange} required >
              <option value="">Select Apartment</option>
              {apartments.map(aprt =>(
                <option key={aprt._id} value={aprt._id}> {aprt.apartment_name}</option>
              ))}
            </select>
          </div>
        </div>
        <button type='submit'
        className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md hover:rounded hover:cursor-pointer '
        >Edit Resident</button>
      </form>
    </div>) : <div>Loading ...</div> }</>
  )
}

export default Edit