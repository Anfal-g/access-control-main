import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext';
import axios from 'axios';

const Setting = () => {
    const navigate =useNavigate();
    const {user} =useAuth();
    const [setting,setSetting]= useState({
        userId: user._id,
        oldPassword:"",
        newPassword:"",
        confirmPassword:""
    });
    const [error,setError]=useState(null);
    const handleChange =(e) =>{
        const {name, value} = e.target;
        setSetting({...setting, [name]: value});

    }
    
    const handleSubmit = async (e) =>{
        e.preventDefault();
        if(setting.newPassword !== setting.confirmPassword){
            setError("Password not matched")
        }else{
            try {
                const response = await axios.post(
                    "http://localhost:5001/api/setting/change-password",setting,
                    {   
                        headers:{
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
    
                    }
                );
                // console.log("###########",response)
                if(response.data.success){
                    navigate("/resident-dashboard")
                    // /admin-dashboard/employees
                    setError("")
                }
            } catch (error) {
                console.log(error)
                if(error.response && !error.response.data.success){
                    setError(error.response.data.error)
                }
            }
        }
    }
  return (
    <div className='max-3xl mx-auto mt-10 bg-wgite p-8 rounded-md shadow-md w-96 dark:bg-gray-800 dark:text-white'>
        <h2 className='text-2xl font-bold mb-6'>Change Password</h2>
        <p className='text-red-500'>{error}</p>
        <form onSubmit={handleSubmit}>
            <div>
                <label className='text-sm font-medium text-gray-700 dark:text-white'>Old Password</label>
                <input type="password" name="oldPassword" 
                    placeholder='Change Password'
                    onChange={handleChange} 
                    className='mt-2 w-full p-2 border border-gray-300 rounded-md'
                    required
                />
            </div>

            <div>
                <label className='text-sm font-medium text-gray-700 dark:text-white'>New Password</label>
                <input type="password" name="newPassword" 
                    placeholder='New Password'
                    onChange={handleChange} 
                    className='mt-A w-full p-2 border border-gray-300 rounded-md'
                    required
                />
            </div>

            <div>
                <label className='text-sm font-medium text-gray-700 dark:text-white'>Confirm Password</label>
                <input type="password" name="confirmPassword" 
                    placeholder='Confirm Password'
                    onChange={handleChange} 
                    className='mt-A w-full p-2 border border-gray-300 rounded-md'
                    required
                />
            </div>
            <button type='submit'
                className='w-full mt-6 hover:bg-teal-700  font-bold py-2 px-4
                bg-teal-600 rounded text-white'>
                Change Password
            </button>
        </form>
    </div>
  )
}

export default Setting