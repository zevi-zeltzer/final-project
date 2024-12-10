import React from 'react'
import { Navigate,Outlet } from 'react-router-dom'

function ProtectedPages() {

const token = sessionStorage.getItem('token')
const userInfo = localStorage.getItem('userInfo')
if (!token || !userInfo) {
   return <Navigate to="/login" />
}

  return (
    <Outlet />
  )
}

export default ProtectedPages