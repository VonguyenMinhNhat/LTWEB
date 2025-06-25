import React, { useState, useEffect } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Login from "./pages/login";
import Signup from "./pages/signUpPage";
import SignUpInfoPage from './pages/signUpInfoPage';
import Sidebar from './components/sidebar';
import Charts from './components/charts';
import Profile from './components/profiles';
import NotFound from './pages/notFound';
import FoodSearch from './pages/foodSearch';
import Header from './components/Header';
import IndexPage from './pages/Index'; // ✅ Trang giới thiệu
import PhysicalInfo from './pages/physicalInfo';
import Home from './pages/Home';
import RequireAuth from './components/RequireAuth';

// Layout wrapper for all protected pages
import HealthierSuggestionsPage from './pages/HealthierSuggestionsPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
const Layout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const toggleSidebar = () => setCollapsed(!collapsed);

    return (
        <div className="flex min-h-screen">
            <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
            <div className={`transition-all duration-300 flex-1 bg-gray-100 ${collapsed ? 'ml-20' : 'ml-64'}`}>
                <Header />
                <div className="p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Monitor the token and update the state when it's set or removed
    useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, []);

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/index" element={<IndexPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signUpPage" element={<Signup />} />
            <Route path="/signup-info" element={<SignUpInfoPage />} />

            {/* Protected routes guarded by RequireAuth */}
            <Route element={<RequireAuth />}>
                <Route path="/" element={<Layout />}>
                    {/* Redirect “/” → “/home” */}
                    <Route index element={<Navigate to="home" replace />} />
                    <Route path="home" element={<Home />} />
                    <Route path="physical-info" element={<PhysicalInfo />} />
                    <Route path="food" element={<FoodSearch />} />
                    <Route path="healthier-suggestions" element={<HealthierSuggestionsPage />} />
                    <Route path="charts" element={<Charts />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Route>

            {/* If user enters anything else, send them to /index */}
            <Route path="*" element={token ? <Navigate to="home" replace /> : <Navigate to="/index" replace />} />
        </Routes>
    );
};

export default App;