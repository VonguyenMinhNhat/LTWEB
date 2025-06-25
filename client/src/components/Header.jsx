// client/src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../styles/Header.css";
import Popup from "./Popup";

const Header = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupSuccess, setPopupSuccess] = useState(true);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const panelRef = useRef();
    const token = localStorage.getItem("token");

    // 1) Lấy danh sách notifications
    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await axios.get("/api/notifications", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data || []);
        } catch (err) {
            console.error("Failed to load notifications", err);
        }
    };

    // 2) useEffect để fetch lần đầu và lắng nghe storage event
    useEffect(() => {
        if (!token) return;

        fetchNotifications();

        // Mỗi 1s fetch lại
        const interval = setInterval(fetchNotifications, 1000);

        // Lắng nghe event storage
        const onStorage = e => {
            if (e.key === "new-notification") {
                fetchNotifications();
                localStorage.removeItem("new-notification");
            }
        };
        window.addEventListener("storage", onStorage);

        return () => {
            clearInterval(interval);
            window.removeEventListener("storage", onStorage);
        };
    }, [token]);

    // 3) Đóng panel nếu click bên ngoài
    useEffect(() => {
        const handleClickOutside = e => {
            if (open && panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    // 4) Đánh dấu tất cả là đã đọc
    const markAllAsRead = async () => {
        try {
            await axios.put(
                "/api/notifications/read-all",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
        } catch (err) {
            console.error("Failed to mark notifications as read", err);
        }
    };

    // 5) Xóa một notification
    const deleteNotification = async id => {
        try {
            await axios.delete(`/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error("Failed to delete notification", err);
        }
    };

    // 6) Khi click vào một notification, đánh dấu là đã đọc và show detail qua Popup
    const handleClickNotif = async notif => {
        try {
            // Gọi PUT /api/notifications/:id/read
            const res = await axios.put(
                `/api/notifications/${notif.id}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // res.data = { detail: "..." } hoặc { detail: null }
            const detail = res.data.detail;

            // Cập nhật is_read = 1 cục bộ
            setNotifications(prev =>
                prev.map(n => (n.id === notif.id ? { ...n, is_read: 1 } : n))
            );

            // Hiển thị detail qua Popup
            if (detail) {
                setPopupMessage(`Detail:\n${detail}`);
                setPopupSuccess(true);
            } else {
                setPopupMessage("No specific details.");
                setPopupSuccess(true);
            }
            setIsPopupOpen(true);
        } catch (err) {
            console.error("Error marking notification as read or fetching detail:", err);
            setPopupMessage("An error occurred while retrieving notification details.");
            setPopupSuccess(false);
            setIsPopupOpen(true);
        }
    };

    return (
        <>
        <div className="notif-container" ref={panelRef}>
            <button
                className="notif-btn"
                onClick={() => setOpen(prev => !prev)}
                title="Notifications"
            >
                <FontAwesomeIcon icon={faBell} />
                    {notifications.some(n => n.is_read === 0) && <span className="notif-dot" />}
            </button>

            {open && (
                <div className="notif-panel">
                    <div className="panel-header">
                        <span>Notifications</span>
                        <button
                            className="close-btn"
                            onClick={() => setOpen(false)}
                            title="Close"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <div className="notif-content">
                            {notifications.length === 0 ? (
                                <p>No notifications.</p>
                            ) : (
                                <ul className="notif-list">
                                    {notifications.map((n, idx) => (
                                        <li
                                            key={idx}
                                            className={`notif-item ${n.is_read ? "read" : "unread"}`}
                                            onClick={() => handleClickNotif(n)}
                                        >
                                            <div className="notif-message">{n.message}</div>
                                            <div className="notif-time">
                                                {new Date(n.created_at).toLocaleString()}
                                            </div>
                                            <button
                                                className="delete-notif-btn"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    deleteNotification(n.id);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {notifications.length > 0 && (
                                <button className="mark-read-btn" onClick={markAllAsRead}>
                                    Mark all as read
                                </button>
                            )}
                    </div>
                </div>
            )}
        </div>

            {/* Popup hiển thị chi tiết thông báo */}
            <Popup
                open={isPopupOpen}
                message={popupMessage}
                success={popupSuccess}
                onClose={() => setIsPopupOpen(false)}
            />
        </>
    );
};

export default Header;
