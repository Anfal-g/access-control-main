import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from "react-icons/fa";

const AddApartment = () => {
    const [apartment,setApartment] = useState({
        apartment_name: '',
        description:''
    })
    const Navigate = useNavigate()
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange =(e)=>{
        const {name,value} =e.target;
        //update the apartment object if name or desc
        setApartment({...apartment, [name] : value})
    }

    const handleSubmit = async(e)=>{
        e.preventDefault() //dima fi submit function       
        try {
            //pass data to server in apartment object
            const response = await axios.post('http://localhost:5001/api/apartment/add', apartment,{
                headers:{
                    //prefix the bearre with token ,, we will pass the token to check it is for admin or not
                    "Authorization": `Bearer ${localStorage.getItem('token')}` //pass it with request
                }
            })
             if(response.data.success){
                //if true move to apartment list
                Navigate("/admin-dashboard/apartments")
             }
        } catch (error) {
            setErrorMessage(error.response.data.error);
            setSuccessMessage('');
            if(error.response && !error.response.data.success){
                // alert(error.response.data.error)
            }
        }
    }
  return (
    <div className='max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md w-96 dark:bg-gray-800 dark:text-white'>
            <button onClick={() => Navigate(-1)}
                className="flex items-center text-teal-600 hover:text-teal-800 mb-4 hover:cursor-pointer "
            >
                <FaArrowLeft className="mr-2" />
                Back
            </button>
            <h2 className='text-2xl font-bold mb-6'>Add Apartment</h2>
            {successMessage && <div className="bg-green-100 text-green-800 p-3 mb-4 rounded">{successMessage}</div>}
            {errorMessage && <div className="bg-red-100 text-red-800 p-3 mb-4 rounded">{errorMessage}</div>}
            <form onSubmit={handleSubmit} >
                <div>
                    <label htmlFor="apartment_name"
                    className='text-sm font-medium text-gray-700 dark:text-white'>Apartment Name</label>
                    <input type="text" name='apartment_name' placeholder='Enter apartment Name' 
                    className='mt-1 w-full p-2 border border-gray-300 rounded-md' required
                    onChange={handleChange}/>   
                </div>
                <div className='mt-3'>
                    <label htmlFor="description"
                    className='block text-sm font-medium text-gray-700 dark:text-white'>Description</label>
                    <textarea type="description" name='description' placeholder='Description'
                    className='mt-1 p-2 block w-full border border-gray-300 rounded-md' rows="4"
                    onChange={handleChange}></textarea>   
                </div>
                <button type='submit' 
                className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded'>Add Apartment</button>
            </form>
    </div>
  )
}

export default AddApartment