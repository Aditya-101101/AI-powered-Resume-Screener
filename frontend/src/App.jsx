import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import UserSignUp from './pages/user/UserSignUp'
import UserLogin from './pages/user/UserLogin'
import RecruiterSignUp from './pages/recruiter/RecruiterSignUp'
import RecruiterLogin from './pages/recruiter/RecruiterLogin'
import UserDashboard from './pages/user/UserDashboard'
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import ProtectedRoute from './components/ProtectedRoute'
const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/user-register' element={<UserSignUp />} />
        <Route path='/user-login' element={<UserLogin />} />
        <Route path='/recruiter-register' element={<RecruiterSignUp />} />
        <Route path='/recruiter-login' element={<RecruiterLogin />} />

        <Route path='/user-dashboard' element={<ProtectedRoute allowedRole="USER"><UserDashboard /></ProtectedRoute>} />
        <Route path='/recruiter-dashboard' element={<ProtectedRoute allowedRole="RECRUITER"><RecruiterDashboard /></ProtectedRoute>} />
        </Routes>
    </>
      )
}

 export default App
