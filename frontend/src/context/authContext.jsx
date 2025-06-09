//handle the user info we will access all the info throught all the components
import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from "axios";

const userContext = createContext()
const authContext = ({ children }) => {
    //user info ** we store the user info in the user var
    const [user ,setUser ] = useState(null)
    const [loading, setLoading]= useState(true)

    //call the server and verify the user
    useEffect(()=>{
        const verifyUser =async ()=>{
            try {
                const token =localStorage.getItem('token')
                if(token){
                    //Sends token to the backend to check if it’s still valid
                    const response = await axios.get("http://localhost:5001/api/auth/verify", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    /*const response = await axios.get("http://localhost:5000/api/auth/verify",{
                        headers: {
                            //pass the token 
                            "Authorization": `Bearer ${token}` 
                            // means the server side consider as  quthorization ** it means the token security purpose just prefix bearer before that
                        }
                    });*/
                    console.log(response)
                    if(response.data.success){
                        //If valid, store user info.
                        setUser(response.data.user)
                    }
                }else{
                   //if the token was not existed
                   // navigate('/login')
                   setUser(null)
                   setLoading(false)
                   
                }
            } catch (error) {
                //should go back to login bach if there is problem
                console.log(error)
                if(error.response && !error.response.data.error){
                    // navigate('/login')
                    setUser(null)
                }
                // else{
                //     setError("Server Error")
                // }
            }finally{
                setLoading(false)
            }
        }
        verifyUser()
    },[]) 

    //login fucntion beacuse when i log to tho system we will call this fucntion to store the info inside this user variable
    const login = (user) =>{
        //we will receive user and pass it
        // Called after successful login to store user info.
        setUser(user)
    }

    const logout = () =>{
        //Clears user and token.
        setUser(null)
        localStorage.removeItem("token")
    } 
    return(
        //whaever inside this provider all those component can acc these 3
        <userContext.Provider value={{user, login, logout, loading}}>
            {/* /pass children */}
            {children}
        </userContext.Provider>
    )
}

//this means that we can access all 3 values through useAuth
export const useAuth = () => useContext(userContext)
export default authContext;