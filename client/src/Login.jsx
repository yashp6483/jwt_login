import { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';


function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("https://jwt-login-mu.vercel.app/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }), // no token here
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Invalid credentials");
                return;
            }

            // Save token and user in localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect to profile page
            navigate("/users");
        } catch (err) {
            alert("Server error");
            console.error(err);
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

                                <form onSubmit={handleLogin}>

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
                                        <button type="button" className="btn btn-link p-0">
                                            Forgot password?
                                        </button>
                                    </div>

                                    <div className="mb-4 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="remember"
                                        />
                                        <label className="form-check-label" htmlFor="remember">
                                            Remember me
                                        </label>
                                    </div>

                                    <button type="submit" className="btn btn-primary w-100" >
                                        Sign In
                                    </button>
                                </form>

                                <div className="text-center mt-4">
                                    <span className="text-muted">New here?</span>{' '}
                                    <button type="button" className="btn btn-link p-0" onClick={() => navigate("/signup")}>
                                        Create an account
                                    </button>
                                </div>
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

export default Login;

