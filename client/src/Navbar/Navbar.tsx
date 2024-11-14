import { useState } from "react";
import { useUser } from "../hooks/UseUser"; // hook to get info about current user
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom"; // Import Link for navigation

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const user = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (user && user.role == "instructor") {
    return (
      <nav className="navbar">
        <h1 className="logo">
          {user ? `${user.firstName} ${user.lastName}` : "Welcome"}
        </h1>

        <div
          className={
            isMobile ? "nav-links-mobile nav-center" : "nav-links nav-center"
          }
          onClick={() => setIsMobile(false)}
        >
          <li>
            <Link to="/instructor/Home">Home</Link>
          </li>
          <li>
            <Link to="/instructor/SummaryView">Summary of Results</Link>
          </li>{" "}
          {/* Added Summary of Results link */}
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>

        <button
          className="mobile-menu-icon"
          onClick={() => setIsMobile(!isMobile)}
        >
          {isMobile ? (
            <i className="fas fa-times"></i>
          ) : (
            <i className="fas fa-bars"></i>
          )}
        </button>
      </nav>
    );
  } else if (user && user.role == "student") {
    return (
      <nav className="navbar">
        <h1 className="logo">
          {user ? `${user.firstName} ${user.lastName}` : "Welcome"}
        </h1>

        <div
          className={
            isMobile ? "nav-links-mobile nav-center" : "nav-links nav-center"
          }
          onClick={() => setIsMobile(false)}
        >
          <li>
            <Link to="/student/Home">Home</Link>
          </li>
          {/* Added Summary of Results link */}
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>

        <button
          className="mobile-menu-icon"
          onClick={() => setIsMobile(!isMobile)}
        >
          {isMobile ? (
            <i className="fas fa-times"></i>
          ) : (
            <i className="fas fa-bars"></i>
          )}
        </button>
      </nav>
    );
  }
};

export default Navbar;
