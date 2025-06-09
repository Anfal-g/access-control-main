import React from 'react'
import { usedarkMode } from '../context/ThemeContext'
import { FaMoon,FaSun } from 'react-icons/fa';

const DarkModeToggler = () => {
    // const darkMode = false
    const{darkMode, setDarkMode}=usedarkMode()
  return (
    <button onClick={()=> setDarkMode(!darkMode)} className='hover:text-yellow-300 hover:rounded hover:cursor-pointer ' >
        {darkMode ? <FaSun size={22}/> : <FaMoon size={22} />}
    </button>
  )
}

export default DarkModeToggler