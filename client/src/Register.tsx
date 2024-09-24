import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/register", { name, email, password, role })
      .then((result) => {
        console.log(result);
        navigate("/login");
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
      <div className="bg-white p-3 rounded w-25">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name">
              <strong>Name</strong>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              autoComplete="off"
              className="form-control rounded-0"
              onChange={(e: any) => setName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email">
              <strong>Email</strong>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              autoComplete="off"
              className="form-control rounded-0"
              onChange={(e: any) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password">
              <strong>Password</strong>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              className="form-control rounded-0"
              onChange={(e: any) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="role" className="me-2">
              <strong>Student</strong>
            </label>
            <input
              type="radio"
              id="student"
              name="role"
              value="student"
              className="form-check-input me-3"
              onChange={(e: any) => setRole(e.target.value)}
            />
            <label htmlFor="role" className="me-2">
              <strong>Instructor</strong>
            </label>
            <input
              type="radio"
              id="instructor"
              name="role"
              value="instructor"
              className="form-check-input me-4"
              onChange={(e: any) => setRole(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-success w-100 rounded-0">
            Register
          </button>
        </form>
        <br />
        <p>Already have an account?</p>
        <Link
          to="/login"
          className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default Register;
