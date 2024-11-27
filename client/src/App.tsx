import 'bootstrap/dist/css/bootstrap.min.css'
import Register from './Register'
import Login from './Login'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode';

import StudentGroup from './StudentDashboard/StudentGroup.tsx'
import HomeStudent from './StudentDashboard/Home.tsx'
import './StudentDashboard/StudentDashboard.css'

import HomeInstructor from './InstructorDashboard/Home.tsx'
import Group from "./InstructorDashboard/Group.tsx"
import SummaryView from './InstructorDashboard/SummaryView.tsx'
import Navbar from './Navbar/Navbar.tsx'
import './InstructorDashboard/InstructorDashboard.css'
import DetailedView from './InstructorDashboard/DetailedView.tsx';

const ProtectedRoute = ({ element: Component, requiredRole, ...rest }: any) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }

  let userRole;
  try {
    const decodedToken = jwtDecode<{role: string}>(token);
    userRole = decodedToken.role;
  } catch (e) {
    console.log(e);
    return <Navigate to="/login" />;
  }
  if (requiredRole == userRole) {
    return <Component {...rest} />;
  } else {
    if (userRole == 'student') {
      return <Navigate to="/student/home" />;
    } else if (userRole == 'instructor') {
      return <Navigate to="/instructor/home" />;
    }
  }
}


function App() {

  const StudentDashboard = () => (
    <>
      <Navbar />
      <Routes>
        <Route path="/home" element={<HomeStudent />} />
        <Route path="group/:groupId" element={<StudentGroup />}></Route>
      </Routes>
    </>
  );

  const InstructorDashboard = () => (
    <>
      <Navbar />
      <Routes>
        <Route path="home" element={<HomeInstructor />} />
        <Route path="SummaryView" element={<SummaryView />} />
        <Route path="group/:groupId" element={<Group />} />
        <Route path="group/:groupId/student/:studentId" element={<DetailedView />} />
        <Route path="*" element={<Navigate to="/instructor/home" />} />
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
        <Route path="/student/*" element={<ProtectedRoute element={StudentDashboard} requiredRole="student" />} />
        <Route path="/instructor/*" element={<ProtectedRoute element={InstructorDashboard} requiredRole="instructor" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
