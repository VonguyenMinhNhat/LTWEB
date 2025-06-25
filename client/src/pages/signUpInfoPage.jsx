import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/signUpInfoPage.css";

const SignUpInfoPage = () => {
    const [info, setInfo] = useState({
        name: '',
        age: '',
        weight: '',
        height: '',
        gender: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const basic = localStorage.getItem("signup_basic");
        if (!basic) {
            alert("Missing basic information. Please register again.");
            navigate("/signUpPage");
        }
    }, [navigate]);

    const handleChange = e => {
        setInfo({ ...info, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const basic = JSON.parse(localStorage.getItem("signup_basic") || "{}");
        if (!basic.email || !basic.password) {
            alert("Missing basic information. Please register again.");
            return navigate("/signUpPage");
        }


        const payload = {
            ...basic,
            ...info,
            age: Number(info.age),
            weight: Number(info.weight),
            height: Number(info.height)
        };

        try {
            // Register
            let res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const { error } = await res.json();
                throw new Error(error || "Registration failed.");
            }

            // Auto login
            res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: basic.email,
                    password: basic.password
                })
            });

            const loginData = await res.json();
            if (!res.ok) throw new Error(loginData.message || "Login failed.");

            // Save token and redirect
            localStorage.setItem("token", loginData.token);
            localStorage.removeItem("signup_basic");
            alert("🎉 Registration and login successful!");
            navigate("/login");
        } catch (err) {
            alert("❌ " + err.message);
        }
    };

    return (
        <div className="info-nensignup">
            <div className="info-form-khung">
                <h2 className="info-tieude">Personal Information</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        value={info.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        required
                        className="info-input"
                    />
                    <input
                        type="number"
                        name="age"
                        value={info.age}
                        onChange={handleChange}
                        placeholder="Age"
                        required
                        className="info-input"
                    />
                    <input
                        type="number"
                        name="weight"
                        value={info.weight}
                        onChange={handleChange}
                        placeholder="Weight (kg)"
                        required
                        className="info-input"
                    />
                    <input
                        type="number"
                        name="height"
                        value={info.height}
                        onChange={handleChange}
                        placeholder="Height (cm)"
                        required
                        className="info-input"
                    />
                    <select
                        name="gender"
                        value={info.gender}
                        onChange={handleChange}
                        required
                        className="info-select"
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    <button
                        type="submit"
                        className="info-submit-btn"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignUpInfoPage;
