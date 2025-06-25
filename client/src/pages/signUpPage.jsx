// src/pages/SignUpPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSignUpForm from '../hooks/useSignUpForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../styles/signUpPage.css';

const SignUpPage = () => {
    const { formData, error, handleChange } = useSignUpForm();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const handleNext = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) {
            alert('Please fill in all required information.');
            return;
        }
        localStorage.setItem('signup_basic', JSON.stringify(formData));
        navigate('/signup-info');
    };

    return (
        <div className="nen-dang-ky min-h-screen flex items-center justify-center">
            <div className="dangky-khung-chinh w-4/5 max-w-5xl flex overflow-hidden">
                <div className="dangky-form-benh w-3/4 p-12 flex flex-col justify-center">
                    <h2 className="dangky-tieu-de text-4xl font-bold text-center text-blue-700 mb-4">
                        CREATE ACCOUNT
                    </h2>
                    <p className="dangky-mo-ta text-center text-gray-500 mb-6">
                        Sign up and start your journey.
                    </p>

                    <div className="dangky-mxh-khung flex gap-4 mb-6 justify-center">
                        <button className="dangky-mxh-facebook bg-[#3b5998] text-white rounded-full w-10 h-10">
                            f
                        </button>
                        <button className="dangky-mxh-google bg-[#db4437] text-white rounded-full w-10 h-10">
                            G+
                        </button>
                        <button className="dangky-mxh-linkedin bg-[#0077b5] text-white rounded-full w-10 h-10">
                            in
                        </button>
                    </div>

                    <div className="dangky-hoac-khung flex items-center my-6">
                        <div className="dangky-hoac-duong-ke flex-grow h-px bg-gray-300"></div>
                        <span className="dangky-hoac-chu px-4 text-gray-400">OR</span>
                        <div className="dangky-hoac-duong-ke flex-grow h-px bg-gray-300"></div>
                    </div>

                    <form onSubmit={handleNext} className="dangky-form space-y-4 mx-auto max-w-md">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className="dangky-input w-full px-3 py-2 rounded bg-gray-100"
                        />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="dangky-input w-full px-3 py-2 rounded bg-gray-100"
                        />
                        {error && (
                            <p className="dangky-loi text-red-500 text-sm mt-1">{error}</p>
                        )}

                        {/* PASSWORD FIELD WITH EYE ICON */}
                        <div className="relative w-full">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className="dangky-input w-full pr-10 px-3 py-2 rounded bg-gray-100"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                tabIndex={-1}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="dangky-nut-tieptuc mx-auto block bg-gray-700 text-white px-12 py-2 rounded-full mt-4"
                        >
                            Next
                        </button>
                    </form>
                </div>

                <div className="dangky-da-co-tai-khoan w-1/4 bg-gradient-to-br from-blue-400 to-green-500 text-white p-10 flex flex-col justify-center items-center">
                    <h2 className="dangky-da-co-tieu-de text-2xl font-bold mb-4 text-center">
                        ALREADY HAVE AN ACCOUNT?
                    </h2>
                    <p className="dangky-da-co-mo-ta mb-6">
                        Log in to explore the website
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="dangky-nut-dangnhap bg-white text-teal-600 px-6 py-2 rounded-full font-medium"
                    >
                        Log In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
