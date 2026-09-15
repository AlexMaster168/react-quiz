import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { logout } from '../../store/slices/authSlice.js'

function Logout() {
  const dispatch = useDispatch()
  React.useEffect(() => {
    dispatch(logout())
  }, [dispatch])
  return <Navigate to="/" />
}

export default Logout
