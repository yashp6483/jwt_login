import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './Login'
import SignUp from './SignUp'
import Profile from './Profile'

export default function App() {
  return (
    <Routes>
     <Route path="/" element={<Login />} />
     <Route path="/login" element={<Login />} />
     <Route path="/signup" element={<SignUp />}/>
     <Route path='/users' element={<Profile />}/>
    </Routes>
  )
}
