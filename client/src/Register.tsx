import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [errorType, setErrorType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/register", { firstName, lastName, email, password, role })
      .then((result) => {
        console.log(result);
        navigate("/login");
      })
      .catch((error) => {
        setErrorType(String(error.response.data.type));
        setErrorMessage(String(error.response.data.message));
      });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundImage: `url(concordia_img.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div id="box" className="bg-white p-4 rounded" style={{ backdropFilter: 'blur(15px)', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)' }}>
        <h2 className="text-center mb-4" style={{ fontWeight: '700', letterSpacing: '1px', color: '#333' }}>Create Your Account</h2>
        <form onSubmit={handleSubmit} className="animate__animated animate__fadeIn">
          <div className="row mb-3">
            <div className="col">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                autoComplete="off"
                className={"form-control rounded-pill" + (errorType == "firstName" ? " border border-danger" : "")}
                onChange={(e: any) => setFirstName(e.target.value)}
              />
              {errorType == "firstName" ? <small className="text-danger">{errorMessage}</small> : null}
            </div>
            <div className="col">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                autoComplete="off"
                className={"form-control rounded-pill" + (errorType == "lastName" ? " border border-danger" : "")}
                onChange={(e: any) => setLastName(e.target.value)}
              />
              {errorType == "lastName" ? <small className="text-danger">{errorMessage}</small> : null}
            </div>
          </div>
          <div className="mb-3 position-relative">
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="off"
              className={"form-control rounded-pill pl-4" + (errorType == "email" ? " border border-danger" : "")}
              onChange={(e: any) => setEmail(e.target.value)}
            />
            {errorType == "email" ? <small className="text-danger">{errorMessage}</small> : null}
          </div>
          <div className="mb-3 position-relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={"form-control rounded-pill pl-4" + (errorType == "password" ? " border border-danger" : "")}
              onChange={(e: any) => setPassword(e.target.value)}
            />
            {errorType == "password" ? <small className="text-danger">{errorMessage}</small> : null}
          </div>
          <div className="mb-4 d-flex flex-column">
            <div className="d-flex">
              <label htmlFor="student" className="me-2" style={{ marginLeft: '11px' }}>
                <strong>Student</strong>
              </label>
              <input
                type="radio"
                id="student"
                name="role"
                value="student"
                className={"form-check-input me-4" + (errorType == "role" ? " border-danger" : " border-dark")}
                onChange={(e) => setRole(e.target.value)}
              />
              <label htmlFor="instructor" className="me-2">
                <strong>Instructor</strong>
              </label>
              <input
                type="radio"
                id="instructor"
                name="role"
                value="instructor"
                className={"form-check-input me-4" + (errorType == "role" ? " border-danger" : " border-dark")}
                onChange={(e) => setRole(e.target.value)}
              />
              {errorType == "role" ? <small className="text-danger">{errorMessage}</small> : null}
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100 rounded-pill" style={{ transition: '0.3s' }}>
            Register
          </button>
        </form>
        <p className="text-center mt-3">Already have an account?</p>
        <Link
          to="/login"
          className="btn btn-outline-secondary w-100 rounded-pill"
          style={{ transition: '0.3s' }}
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default Register;
