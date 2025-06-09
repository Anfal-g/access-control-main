import React, { useState } from "react";
import axios from 'axios';
import { useAuth } from "../context/authContext.jsx";
import { useNavigate } from "react-router-dom";

const Login = ()=>{
    //setEmail will store the value in email ***setEmail is methode ***email is variable
    const [email ,setEmail] = useState('')
    const [password ,setPassword] = useState('')
    const [error ,setError] = useState(null)
    const {login} = useAuth()
    const navigate =useNavigate()

    const handleSubmit = async (e) =>{
        // prevent the default submission of form if we don't write it we will face errors
        e.preventDefault()
        //call the API and we will pass the data and verify the user credintials
        // we will use axios library to pass data to the server side
        //alert("okkk")
        try {
            //post data to the url ***port that used the server 
            //we call this route in the server side + well pass our data
            const response = await axios.post("http://localhost:5001/api/auth/login",{email,password}
            );
            //here we don' need token to pass data
            // this will show what we will get from backend
            //console.log(response)
            if(response.data.success){
                // alert("Successfully login!")
                login(response.data.user)
                localStorage.setItem("token", response.data.token)
                //after store token check it  
                if(response.data.user.role === "admin"){
                    navigate('/admin-dashboard')
                }else{
                    navigate('/resident-dashboard')
                }
            }
            
        } catch (error) {
            console.log("333",error)
            if(error.response && !error.response.data.success){
                setError(error.response.data.error)
            }else{
                setError("Server Error")
            }
        }
    }
    
    return(
        // heigh screen = total screen
        <div className="flex flex-col items-center h-screen justify-center
        bg-gradient-to-b from-teal-600 from-50% to-gray-100 to-50% space-y-6">
            <h2 className="title text-3xl text-white">
                Management System</h2>
            <div className="border shadow p-6 w-80 bg-white">
                 <h2 className="text-2x1 font-bold mb-4">Login</h2>
                 {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleSubmit}>                   
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700">Email</label>
                        <input type="email" className="w-full px-3 py-2 border" name="" id="" 
                        placeholder="Enter Email"
                        required
                        onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    {/* py padding top bottom ** px right and left */}
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700">Password</label>
                        <input type="password" className="w-full px-3 py-2 border" name="" id="" 
                        placeholder="******"
                        required
                        onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="mb-4 flex items-center justify-between">
                        <label className="inline-flex items-center">
                            <input type="checkbox" className="form-checkbox" />
                            <span className="ml-2 text-gray-700">Remember me</span>
                        </label>
                        <a href="#" className="text-teal-600">
                            Forget password?
                        </a>
                    </div>
                    <div className="mb-4">
                        <button type="submit" className="w-full bg-teal-600 text-White py-2">Login</button>
                    </div>
                    {/* <button>Login</button> */}
                </form>
            </div>
        </div>
    )
}

export default Login