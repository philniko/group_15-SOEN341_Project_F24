import 'bootstrap/dist/css/bootstrap.min.css'
import Register from './Register'
import Login from './Login'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import HomeStudent from './StudentDashboard/Home.tsx'
import NavbarStudent from './StudentDashboard/Navbar.tsx'
import './StudentDashboard/StudentDashboard.css'

import HomeInstructor from './InstructorDashboard/Home.tsx'
import Group from "./InstructorDashboard/Group.tsx"
import NavbarInstructor from './InstructorDashboard/Navbar.tsx'
import './InstructorDashboard/InstructorDashboard.css'

const ProtectedRoute = ({ element: Component, ...rest }: any) => {
  const token = localStorage.getItem('token');
  return token ? <Component {...rest} /> : <Navigate to="/login" />; // Redirect to login page if token is null
}


function App() {

  const StudentDashboard = () => (
    <>
      <NavbarStudent />
      <Routes>
        <Route path="/home" element={<HomeStudent />} />
      </Routes>
    </>
  );

  const InstructorDashboard = () => (
    <>
      <NavbarInstructor />
      <Routes>
        <Route path="/home" element={<HomeInstructor />} />
        <Route path="group/:id" element={<Group />}></Route>
      </Routes>
    </>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />

        {/* Routes with Sidebar */}
        <Route path="/*" element={<ProtectedRoute element={StudentDashboard} />} />
        <Route path="/instructor/*" element={<ProtectedRoute element={InstructorDashboard} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
