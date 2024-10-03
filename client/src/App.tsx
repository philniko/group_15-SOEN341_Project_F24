import 'bootstrap/dist/css/bootstrap.min.css'
import Register from './Register'
import Login from './Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './StudentDashboard/Sidebar.tsx'
import './StudentDashboard/StudentDashboard.css'
import Home from './StudentDashboard/Home.tsx'
import MyGroup from './StudentDashboard/MyGroup.tsx'
import UserSettings from './StudentDashboard/UserSettings.tsx'


function App() {

  const LayoutWithSidebar = () => (
      <>
        <Sidebar />
        <Routes>
          <Route path="/Home" element={<Home />} />
          <Route path="/mygroup" element={<MyGroup />} />
          <Route path="/usersettings" element={<UserSettings />} />
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
          <Route path="/*" element={<LayoutWithSidebar />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App
