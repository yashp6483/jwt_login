import {  useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function SignUp() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignUp = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("https://jwt-login-mu.vercel.app/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Invalid credentials");
                return;
            }

            localStorage.setItem("token", data.token);
            navigate("/login");
        } catch (err) {
            alert("Server error");
        }
    };
    return (
        <div className="min-vh-100 bg-light d-flex align-items-center py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-5">
                        <div className="card shadow border-0">
                            <div className="card-body p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <h1 className="h3 fw-bold mb-1">Welcome Back</h1>
                                    <p className="text-muted mb-0">Sign in to continue</p>
                                </div>

                                <form onSubmit={handleSignUp}>
                                     <div className="mb-3">
                                        <label htmlFor="email" className="form-label">
                                           Name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">
                                            Email address
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <label htmlFor="password" className="form-label mb-0">
                                                Password
                                            </label>
                                        </div>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary w-100">
                                        Sign Up
                                    </button>
                                </form>
                            </div>
                        </div>

                        <p className="text-center text-muted mt-3 mb-0 small">
                            By continuing, you agree to our Terms and Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;