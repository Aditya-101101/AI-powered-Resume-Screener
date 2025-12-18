import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import UserSignUp from './pages/user/UserSignUp'
import UserLogin from './pages/user/UserLogin'
import RecruiterSignUp from './pages/recruiter/RecruiterSignUp'
import RecruiterLogin from './pages/recruiter/RecruiterLogin'
import UserDashboard from './pages/user/UserDashboard'

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/user-register' element={<UserSignUp />} />
        <Route path='/user-login' element={<UserLogin />} />
        <Route path='/recruiter-register' element={<RecruiterSignUp />} />
        <Route path='/recruiter-login' element={<RecruiterLogin />} />
        <Route path='/user-dashboard' element={<UserDashboard />} />
      </Routes>
    </>
  )
}

export default App
