import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Register from './Register'
import DashboardInstructor from './DashboardInstructor'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/register' element={<Register />}></Route>
        <Route path='/dashboard-instructor' element={<DashboardInstructor />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
