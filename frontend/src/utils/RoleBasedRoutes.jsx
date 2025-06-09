//protected routes
import React from 'react'
import { useAuth } from '../context/authContext';
import {Navigate} from 'react-router-dom'
 
//this route will check if the user is null we will return to login page
//will pass 2, will pass this route is accessible for admin or employee or both
const RoleBasedRoutes =({children, requiredRole}) =>{
    const {user, loading} = useAuth()

    if (loading){
       return <div>Loading .....</div>
    }
    //requiredRole is array of admin and employee
    if (!requiredRole.includes(user.role)){
        <Navigate to="/unauthorized"/>
    }
 
    //if the user exicted return children sinon navigate to login 
    return user ? children : <Navigate to="/login"/>
}
export default RoleBasedRoutes;