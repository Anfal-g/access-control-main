import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import { columns, ContactButtons } from '../../utils/ContactHelper.jsx'
import axios from 'axios'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { createTheme } from 'react-data-table-component';
import { usedarkMode } from '../../context/ThemeContext.jsx'; // or correct path

createTheme('solarized', {
  text: {
    primary: '#ffffff',
    secondary: '#cccccc',
  },
  background: {
    default: '#1f2937', // Tailwind dark bg: gray-800
  },
  context: {
    background: '#cb4b16',
    text: '#FFFFFF',
  },
  divider: {
    default: '#444444',
  },
  button: {
    default: '#ffffff',
    // hover: 'rgba(255,255,255,0.1)',
    focus: 'rgba(255,255,255,0.2)',
    disabled: 'rgba(255,255,255,0.3)',
  },
}, 'dark');


const Contact = () => {
  const [contacts, setContacts] = useState([])
  const [contLoading, setContLoading] = useState(false)
  const [filteredContacts, setFilteredContacts] = useState([])
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') 
  const { darkMode } = usedarkMode();

  const onContactDelete = async (id) => {
    fetchContacts()
  }

  const fetchContacts = async () => {
    setContLoading(true)
    setError(null)
    try {
      const response = await axios.get("http://localhost:5001/api/contact", {
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
      })

      if (response.data.success) {
        const data = response.data.contacts.map((cont, index) => ({
          _id: cont._id,
          sno: index + 1,
          name: cont.name || "Unknown",
          email: cont.email || "No email",
          subject: cont.subject,
          message: cont.message,
          sentAt: new Date(cont.sentAt).toLocaleDateString(),
          isResolved: cont.isResolved ? "Resolved" : "Pending",
          seen: cont.seen
            ? <FaEye title="Seen" className="text-green-500 text-xl" />
            : <FaEyeSlash title="Unseen" className="text-red-500 text-xl" />,
          action: <ContactButtons 
              Id={cont._id} 
              onContactDelete={onContactDelete} 
              isResolved={cont.isResolved}
          />
        }))

        setContacts(data)
        setFilteredContacts(data)
      }
    } catch (error) {
      console.error("Error:", error)
      if (error.response?.status !== 404) {
        setError(error.response?.data?.error || "Something went wrong")
      }
    } finally {
      setContLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const filterContacts = (e) => {
    const searchTerm = e.target.value.toLowerCase()
    const records = contacts.filter((cont) =>
      cont.name.toLowerCase().includes(searchTerm)
    )
    setFilteredContacts(records)
  }

  const filterByButton = (status) => {
    setFilter(status) // Set the active filter
    if (status === 'all') {
      setFilteredContacts(contacts)
    } else {
      const data = contacts.filter(contact => contact.isResolved.toLowerCase() === status.toLowerCase())
      setFilteredContacts(data)
    }
  }

  return (
    <>
      {contLoading ? (
        <div>Loading...</div>
      ) : (
        <div className='p-5'>
          <div className='text-center'>
            <h3 className='text-2xl font-bold'>Manage Messages</h3>
          </div>
          <div className='flex justify-between items-center'>
            <input
              type="text"
              placeholder='Search By Resident name'
              className='px-4 py-0.5 border'
              onChange={filterContacts}
            />
            <div className="space-x-2">
              {['all', 'pending', 'resolved'].map((type) => (
                <button
                  key={type}
                  onClick={() => filterByButton(type)}
                  className={`px-4 py-2 rounded hover:rounded hover:cursor-pointer  ${
                    filter === type ? 'bg-teal-600 text-white' : 'bg-gray-200 hover:bg-gray-500 dark:bg-white/10'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className='mt-5'>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <DataTable
              columns={columns}
              data={filteredContacts}
              pagination
              theme={darkMode ? 'solarized' : 'default'}
              noDataComponent="No messages found."
            />
          </div>
        </div>
      )}
    </>
  )
}

export default Contact
