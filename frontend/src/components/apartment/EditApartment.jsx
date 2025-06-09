import React, { useEffect ,useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { FaArrowLeft } from 'react-icons/fa'

const EditApartment = () => {
    const {id} =useParams() //get id from url
    
    const [apartment,setApartment]=useState([])
    const [aprtLoading,setAprtLoading]=useState(false)
    const Navigate = useNavigate()

    const handleChange =(e)=>{
        const {name,value} =e.target;
        //update the Aprt object if name or desc
        setApartment({...apartment, [name] : value})
    }

    //fetch record based on this ID
    useEffect(()=>{
        const fetchApartments= async () => {
          setAprtLoading(true)
          try {
            const response = await axios.get(`http://localhost:5001/api/apartment/${id}`,{
              headers:{
                "Authorization": `Bearer ${localStorage.getItem('token')}`
              }
            })

            if(response.data.success){
                setApartment(response.data.apartment)
            }
          } catch (error) {
            if(error.response && !error.response.data.success){
              alert(error.response.data.error)
          }
          } finally{
            setAprtLoading(false)
          }
        };
        fetchApartments() ;//to return data from server
      },[])//run at the start of compenants
    
    const handleSubmit = async(e)=>{
        //const {id} =useParams()
        // console.log("####",id)
        e.preventDefault() //dima fi submit function       
        try {
            //pass data to server in Aprt object
            // console.log("####",id)
            const response = await axios.put(
                `http://localhost:5001/api/apartment/${id}`,
                 apartment,{
                headers:{
                    //prefix the bearre with token ,, we will pass the token to check it is for admin or not
                    "Authorization": `Bearer ${localStorage.getItem('token')}` //pass it with request
                }
            })
            console.log("Updating Apartment with ID:", id);

             if(response.data.success){
                //if true move to Aprt list
                Navigate("/admin-dashboard/apartments")
             }
        } catch (error) {
            console.log(error)
            if(error.response && !error.response.data.success){
                alert(error.response.data.error)
            }
        }
    }
  return (
    <>{aprtLoading ? <div> Loading ....</div> : 
    <div className='max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md w-96 dark:bg-gray-800 dark:text-white'>
            <button onClick={() => Navigate(-1)}
              className="flex items-center text-teal-600 hover:text-teal-800 mb-4 hover:cursor-pointer "
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>

            <h2 className='text-2xl font-bold mb-6'>Edit Apartment</h2>
            <form onSubmit={handleSubmit} >
                <div>
                    <label htmlFor="apartment_name"
                    className='text-sm font-medium text-gray-700 dark:text-white'>Apartment Name</label>
                    <input type="text" name='apartment_name' placeholder='Enter Aprt Name' 
                    className='mt-1 w-full p-2 border border-gray-300 rounded-md' required
                    onChange={handleChange}
                    value={apartment.apartment_name}/>   
                </div>
                {/* <div className='mt-3'>
                    <label htmlFor="owner" className='block text-sm font-medium text-gray-700'>
                        Owner
                    </label>
                    <select 
                        name="ownerId" 
                        onChange={handleChange}
                        className='mt-1 w-full p-2 border border-gray-300 rounded-md'
                    >
                        <option value="">Select Owner</option>
   
                    </select>
                </div> */}
                <div className='mt-3'>
                    <label htmlFor="description"
                    className='block text-sm font-medium text-gray-700 dark:text-white'>Description</label>
                    <textarea type="description" name='description' placeholder='Description'
                    className='mt-1 p-2 block w-full border border-gray-300 rounded-md' rows="4"
                    onChange={handleChange}
                    value={apartment.description}></textarea>   
                </div>
                <button type='submit' 
                className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded'>Edit Apartment</button>
            </form>
    </div>}</>
  )
}

export default EditApartment