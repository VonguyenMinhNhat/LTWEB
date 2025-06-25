import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/sidebar.css';

const Sidebar = ({ collapsed, toggleSidebar }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/index');
    };

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                {/* Thay span thành Link để bấm về Home */}
                <Link to="/home" className="title">
                    Sống Khỏe
                </Link>
                <button onClick={toggleSidebar} className="toggle-btn">☰</button>
            </div>

            <ul className="menu-list">
                <li>
                    <Link to="/food">
                        <i className="fa-solid fa-utensils" />
                        <span>Food</span>
                    </Link>
                </li>

                <li>
                    <Link to="/physical-info">
                        <i className="fas fa-heartbeat"></i>
                        {!collapsed && <span>Physical</span>}
                    </Link>
                </li>

                <li>
                    <Link to="/healthier-suggestions">
                        <i className="fas fa-lightbulb" />
                        <span>HealthierSuggestion</span>
                    </Link>
                </li>

                <li>
                    <Link to="/profile">
                        <i className="fas fa-user" />
                        <span>Profile</span>
                    </Link>
                </li>

                <li>
                    <button onClick={handleLogout} className="logout-btn">
                        <i className="fas fa-sign-out-alt" />
                        <span>Logout</span>
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
