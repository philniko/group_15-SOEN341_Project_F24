import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DashboardInstructor() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  return (
    <div className="d-flex justify-content-center bg-secondary vh-100">
      <div className="bg-white p-3 rounded w-100 h-25">
        <h2>Instructor Dashboard</h2>
        <h3>Welcome!</h3>
      </div>
    </div>
  );
}

export default DashboardInstructor;
