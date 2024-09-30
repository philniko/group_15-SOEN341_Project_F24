import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = (e: any) => {
        e.preventDefault();
        axios
            .post("http://localhost:3001/login", { email, password })
            .then((result) => {
                console.log(result);
                navigate("/"); // Complete the navigate path to whichever dashboard it belongs to
            })
            .catch((err) => console.log(err));
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundImage: `url(concordia_img.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(30%)' }}>
            <div className="bg-white p-4 rounded" style={{ backdropFilter: 'blur(15px)', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)' }}>
                <h2 className="text-center mb-4" style={{ fontWeight: '700', letterSpacing: '1px', color: '#333' }}>Login to your account</h2>
                <form onSubmit={handleSubmit} className="animate__animated animate__fadeIn">
                    <div className="mb-3 position-relative">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            autoComplete="off"
                            className="form-control rounded-pill pl-4"
                            onChange={(e: any) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-3 position-relative">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="form-control rounded-pill pl-4"
                            onChange={(e: any) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 rounded-pill" style={{ transition: '0.3s' }}>
                        Connect
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