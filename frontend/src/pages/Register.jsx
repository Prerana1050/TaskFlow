
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const name = formData.name.trim();
        const email = formData.email.trim();
        const password = formData.password;

        if (name.length < 2) {
            setError("Name must contain at least 2 characters.");
            return;
        }

        if (!email.toLowerCase().endsWith("@gmail.com")) {
            setError("Please enter a valid Gmail address.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);

            await API.post("/auth/register", {
                name,
                email,
                password
            });

            alert("Registration successful! Please login.");
            navigate("/login");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow p-4 w-100" style={{ maxWidth: "400px" }}>

                <h2 className="text-center fw-bold"
                style={{ color: "#714B67" }}>
                    TaskFlow
                </h2>

                <p className="text-center text-muted">
                    Create your account
                </p>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={formData.name}
                            onChange={handleChange}
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={6}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn w-100"
                        disabled={loading}
                        style={{
        backgroundColor: "#714B67",
        borderColor: "#714B67",
        color: "#FFFFFF"
    }}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p className="text-center mt-3 mb-0">
                    Already have an account? <Link to="/login">Login</Link>
                </p>

            </div>
        </div>
    );
}

export default Register;
