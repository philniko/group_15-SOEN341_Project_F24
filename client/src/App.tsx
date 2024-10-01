import 'bootstrap/dist/css/bootstrap.min.css'
import Register from './Register'
import Login from './Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './StudentDashboard/Sidebar.tsx'
import './StudentDashboard/StudentDashboard.css'
import Home from './StudentDashboard/Home.tsx'
import MyGroup from './StudentDashboard/MyGroup.tsx'
import UserSettings from './StudentDashboard/UserSettings.tsx'

import SidebarInstructor from './InstructorDashboard/Sidebar.tsx'
import HomeInstructor from './InstructorDashboard/Home.tsx'
import MyGroupInstructor from './InstructorDashboard/MyGroup.tsx'
import UserSettingsInstructor from './InstructorDashboard/UserSettings.tsx'
import './InstructorDashboard/InstructorDashboard.css'


function App() {

  const LayoutWithSidebar = () => (
      <>
        <Sidebar />
        <Routes>
          <Route path="/Home" element={<Home />} />
          <Route path="/MyGroup" element={<MyGroup />} />
          <Route path="/userSettings" element={<UserSettings />} />
        </Routes>
      </>
  );

  const InstructorDashboard = () => (
    <>
        <SidebarInstructor />
        <Routes>
          <Route path="/Home" element={<HomeInstructor />} />
          <Route path="/MyGroup" element={<MyGroupInstructor />} />
          <Route path="/UserSettings" element={<UserSettingsInstructor />} />
        </Routes>
      </>
  );

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes with Sidebar */}
          <Route path="/*" element={<LayoutWithSidebar />} />
          <Route path="/instructor/*" element={<InstructorDashboard />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App
