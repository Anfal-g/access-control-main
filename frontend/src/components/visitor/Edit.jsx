import React, { useEffect, useState } from 'react'
// import { fetchApartments } from '../../utils/VisitorHelper'
import axios from 'axios'
import {useNavigate, useParams} from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'


const Edit = () => {
  const [visitor ,setVisitor] = useState({
    phone: '',
    visitTimeFrom: '',
    visitTimeTo: ''
  })
  
  const [apartments ,setApartments] = useState(null)
  const Navigate = useNavigate()
  const {id} = useParams();
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(()=>{ 
    // const getApartments = async () => {
    //   const apartments = await fetchApartments()
    //   setApartments(apartments)
    // }
    // getApartments()
  },[])

  useEffect(() => {
    const fetchVisitor = async () => {
      try {
        // console.log("########", id)
        const response = await axios.get(`http://localhost:5001/api/visitor/one/${id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        })

        console.log("Visitor response:", response.data)

        if (response.data.success) {
          const visitor = response.data.visitor
          setVisitor({
            name: visitor.fullName,
            phone: visitor.phone,
            visitTimeFrom: visitor.visitTimeFrom,
            visitTimeTo: visitor.visitTimeTo,

          })
        }
      } catch (error) {
        // if (error.response && error.response.status === 404) {
        //   setErrorMessage('Visitor not found!')
        // } else {
        //   setErrorMessage('An error occurred while fetching visitor data.')
        // }
        console.error('Error fetching visitor:', error)
      }
    }
    fetchVisitor()
  }, [id])

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
     setVisitor((prevData) => ({ ...prevData, [name]: value }));
     
  };
  

  const handleSubmit = async(e)=>{
    e.preventDefault()  //refresh again and again when we run app
    setErrorMessage(''); 

    try {
        //console.log("Updating Visitor with ID:", id);
        //pass data to server 
        const response = await axios.put(`http://localhost:5001/api/visitor/${id}`, 
          visitor,{
            headers:{
                //prefix the bearre with token ,, we will pass the token to check it is for admin or not
                "Authorization": `Bearer ${localStorage.getItem('token')}` //pass it with request
            }
        })
        console.log("🔵 API Response:", response.data);
        if (!response.data.success) {
          console.log("❌ ERREUR: response.success est FALSE !");
        }
        console.log("Updating visitor with ID:", id);

         if (response.data.success) {
          setSuccessMessage("visitor edited successfully!")
          setErrorMessage('')
            // Navigate("/admin-dashboard/visitors")
        }
    } catch (error) {
        console.error("❌Edit visitor FIle Error:", error);
        if (error.response && error.response.data && error.response.data.error) {
          setErrorMessage(error.response.data.error);
        } 
    }
  }

  return (
    // <>{apartments && visitor ? (
    <div className='max-w-4xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md dark:bg-gray-800 dark:text-white'>
      <button onClick={() => Navigate(-1)}
        className="flex items-center text-teal-600 hover:text-teal-800 mb-4 hover:cursor-pointer "
      >
        <FaArrowLeft className="mr-2" />
        Back
      </button>
      <h2 className='text-2xl font-bold mb-6'>Edit Visitor</h2>
      {successMessage && <div className="bg-green-100 text-green-800 p-3 mb-4 rounded">{successMessage}</div>}
      {errorMessage && <div className="bg-red-100 text-red-800 p-3 mb-4 rounded">{errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Phone</label>
            <input type="tel" name="phone"
             value={visitor.phone}
            //  placeholder='Insert Name'
             className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
             required 
             onChange={handleChange}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Time from</label>
            <input type="time" name="visitTimeFrom"
             value={visitor.visitTimeFrom}
            //  placeholder='Insert Name'
             className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
             required 
             onChange={handleChange}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-white'>Time To</label>
            <input type="time" name="visitTimeTo"
             value={visitor.visitTimeTo}
            //  placeholder='Insert Name'
             className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
             required 
             onChange={handleChange}
            />
          </div>
        </div>
        <button type='submit'
        className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md hover:rounded hover:cursor-pointer '
        >Edit visitor</button>
      </form>
    </div>
    // ) : <div>Loading ...</div> }</>
  )
}

export default Edit