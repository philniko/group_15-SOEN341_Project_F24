import { useEffect, useState } from 'react';
import { useUser } from '../hooks/UseUser'; //hook to get info about current user
import './StudentDashboard.css';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom'; // Import Link for navigation

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const user = useUser();

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <h1 className="logo">
        {user ? `${user.firstname}` : 'Welcome'} {/* Display first name if available */}
      </h1>
      <ul className={isMobile ? "nav-links-mobile" : "nav-links"} onClick={() => setIsMobile(false)}>
        {/* Use Link for proper internal routing */}
        <li><Link to="/student/Home">Home</Link></li>
        <li><a href="" onClick={handleLogout}>Logout</a></li>
      </ul>
      <button className="mobile-menu-icon" onClick={() => setIsMobile(!isMobile)}>
        {isMobile ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>}
      </button>
    </nav>
  );
};

export default Navbar;
