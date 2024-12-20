import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.status == 200) {
      const data = await response.json();

      // Store the JWT token in local storage
      localStorage.setItem('token', data.token);
      navigate('/' + data.role + '/home'); // Redirect to dashboard/home page
    }
    else {
      const data = await response.json();
      setErrorMessage(data.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundImage: `url(concordia_img.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(30%)' }}>
      <div className="bg-white p-4 rounded" style={{ backdropFilter: 'blur(15px)', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)' }}>
        <h2 className="text-center mb-4" style={{ fontWeight: '700', letterSpacing: '1px', color: '#333' }}>Login to your account</h2>
        <form onSubmit={handleLogin} className="animate__animated animate__fadeIn">
          <div className="mb-3 position-relative">
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="off"
              className={"form-control rounded-pill pl-4" + (errorMessage != "" ? " border border-danger" : "")}
              onChange={(e: any) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3 position-relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={"form-control rounded-pill pl-4" + (errorMessage != "" ? " border border-danger" : "")}
              onChange={(e: any) => setPassword(e.target.value)}
            />
            {errorMessage == "" ? null : <small className="text-danger">{errorMessage}</small>}
          </div>
          <button type="submit" className="btn btn-primary w-100 rounded-pill" style={{ transition: '0.3s' }}>
            Login
          </button>
        </form>
        <p className="text-center mt-3">Don't have an account?</p>
        <Link
          to="/register"
          className="btn btn-outline-secondary w-100 rounded-pill"
          style={{ transition: '0.3s' }}
        >
          Register
        </Link>
      </div>
    </div>
  );
}

export default Login;
