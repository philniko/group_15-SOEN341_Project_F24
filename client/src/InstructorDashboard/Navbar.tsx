import { useEffect, useState } from 'react';
import { useUser } from '../hooks/UseUser'; //hook to get info about current user
import './InstructorDashboard.css';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';

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
        <li><a href="Home">Home</a></li>
        <li><a href="" onClick={handleLogout}>Logout</a></li>
      </ul>
      <button className="mobile-menu-icon" onClick={() => setIsMobile(!isMobile)}>
        {isMobile ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>}
      </button>
    </nav>
  );
};

export default Navbar;
