import 'bootstrap/dist/css/bootstrap.min.css'
import Register from './Register'
import DashboardInstructor from './DashboardInstructor'
import Login from './Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path='/register' element={<Register />}></Route>
        <Route path='/dashboard-instructor' element={<DashboardInstructor />}></Route>
        <Route path='/login' element={<Login />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
