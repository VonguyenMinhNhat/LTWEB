import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
            <h1 className="text-6xl font-bold text-teal-600 mb-4">404</h1>
            <p className="text-gray-700 text-xl mb-6">The page you are looking for was not found.</p>
            <Link to="/dashboard" className="bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition">
                Go back to homepage
            </Link>
        </div>
    );
};

export default NotFound;
