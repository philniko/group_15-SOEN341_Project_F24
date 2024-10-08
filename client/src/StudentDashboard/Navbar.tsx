import { useEffect, useState } from 'react';
import { useUser } from '../hooks/UseUser'; //hook to get info about current user
import './StudentDashboard.css';  
import './Navbar.css';

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const user = useUser();

  return (
    <nav className="navbar">
      <h1 className="logo">
        {user ? `${user.firstname}` : 'Welcome'} {/* Display first name if available */}
      </h1>
      <ul className={isMobile ? "nav-links-mobile" : "nav-links"} onClick={() => setIsMobile(false)}>
        <li><a href="Home">Home</a></li>
        <li><a href="logout">Logout</a></li>
      </ul>
      <button className="mobile-menu-icon" onClick={() => setIsMobile(!isMobile)}>
        {isMobile ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>}
      </button>
    </nav>
  );
};

export default Navbar;
