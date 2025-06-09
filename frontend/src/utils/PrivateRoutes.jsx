import React from 'react'
import { useAuth } from '../context/authContext';
import {Navigate} from 'react-router-dom'
 //if the user logged in or not
//this private route will check if the user is null we will return to login page
const PrivateRoutes =({children}) =>{
    const {user, loading} = useAuth()

    if (loading){
        return <div>Loading .....</div>
    }
    //if the user exicted return children sinon navigate to login 
    return user ? children : <Navigate to="/login"/>
}
export default PrivateRoutes;