// client/src/components/Popup.js

import React, { useEffect, useRef } from 'react';
import '../styles/Popup.css';

const Popup = ({ open, message, success, onClose }) => {
    const panelRef = useRef();

    // Đóng popup khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (open && panelRef.current && !panelRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, onClose]);

    // Nếu open === false, không render gì
    if (!open) return null;

    return (
        <div className="popup-overlay">
            <div
                ref={panelRef}
                className={`popup-box ${success ? 'success' : 'error'}`}
            >
                {/* 
          Sửa ở đây: thêm style white-space: pre-wrap 
          để giữ nguyên dấu xuống dòng (\n) trong message 
        */}
                <div className="popup-message" style={{ whiteSpace: 'pre-wrap' }}>
                    {message}
                </div>
                <button onClick={onClose} className="popup-close-btn">
                    Close
                </button>
            </div>
        </div>
    );
};

export default Popup;