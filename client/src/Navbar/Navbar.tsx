import { useState } from "react";
import { useUser } from "../hooks/UseUser"; // hook to get info about current user
import ChatSidebar from "../ChatSidebar/ChatSidebar"; // Import the ChatSidebar component
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom"; // Import Link for navigation
import "bootstrap-icons/font/bootstrap-icons.css"; // Import Bootstrap icons

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // State to toggle ChatSidebar
  const user = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleChatSidebar = () => setIsChatOpen(!isChatOpen); // Toggle chat sidebar

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
        {user?.role === "instructor" && (
          <>
            <li>
              <Link to="/instructor/Home">Home</Link>
            </li>
            <li>
              <Link to="/instructor/SummaryView">Summary of Results</Link>
            </li>
          </>
        )}
        {user?.role === "student" && (
          <li>
            <Link to="/student/Home">Home</Link>
          </li>
        )}
      </div>

      <div className="nav-actions">
        {/* Chat Icon */}
        <button className="chat-icon-button" onClick={toggleChatSidebar}>
          <i className="bi bi-chat-dots"></i>
        </button>

        {/* Logout Button */}
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

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

      <ChatSidebar isOpen={isChatOpen} onClose={toggleChatSidebar} />
    </nav>
  );
};

export default Navbar;
