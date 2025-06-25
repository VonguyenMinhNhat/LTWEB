import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye, faRepeat, faTrashAlt, faSave, faCamera } from '@fortawesome/free-solid-svg-icons';
import '../styles/profile.css';
import Popup from './Popup';

const Profile = () => {
    const [user, setUser] = useState({
        name: '', email: '', age: '', gender: '', goal: '', activity_level: '', weight: '', height: '', avatarUrl: ''
    });
    const [nutritionGoal, setNutritionGoal] = useState({ weight_goal: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPwdForm, setShowPwdForm] = useState(false);
    const [pwdData, setPwdData] = useState({ oldPassword: '', newPassword: '' });
    const [showPwd, setShowPwd] = useState({ old: false, new: false });
    const [pwdError, setPwdError] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [popupMessage, setPopupMessage] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupSuccess, setPopupSuccess] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    //useEffect(() => {
    //    if (!token) return navigate('/login');
    //    axios.get('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
    //        .then(res => {
    //            const data = res.data;
    //            setUser({
    //                name: data.name || '', email: data.email || '', age: data.age || '', gender: data.gender || '',
    //                goal: data.goal || '', activity_level: data.activity_level || '', weight: data.weight || '',
    //                height: data.height || '', avatarUrl: data.avatarUrl || ''
    //            });
    //        })
    //        .catch(() => setError("Failed to load profile"))
    //        .finally(() => setLoading(false));
    //}, [navigate, token]);

    useEffect(() => {
        if (!token) return navigate('/login');

        const fetchProfile = async () => {
            try {
                const res = await axios.get('/api/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = res.data;
                setUser({
                    name: data.name || '',
                    email: data.email || '',
                    age: data.age || '',
                    gender: data.gender || '',
                    goal: data.goal || '',
                    activity_level: data.activity_level || '',
                    weight: data.weight || '',
                    height: data.height || '',
                    avatarUrl: data.avatarUrl || ''
                });
            } catch {
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        const fetchGoal = async () => {
            try {
                const res = await axios.get('/api/profile-goal', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const { calo_goal, protein_goal, carb_goal, fat_goal } = res.data;
                setNutritionGoal({
                    calories: calo_goal ?? null,
                    protein: protein_goal ?? null,
                    carbs: carb_goal ?? null,
                    fat: fat_goal ?? null
                });
            } catch {
                setNutritionGoal({ calories: null, protein: null, carbs: null, fat: null });
            }
        };

        fetchProfile();
        fetchGoal();
    }, [navigate, token]);

    const handleChange = e => setUser({ ...user, [e.target.name]: e.target.value });

    const saveProfile = async e => {
        e.preventDefault();
        try {
            await axios.put('/api/profile', user, { headers: { Authorization: `Bearer ${token}` } });
            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                await axios.post('/api/profile/avatar', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setAvatarFile(null);
            }
            setPopupMessage('✅ Profile saved successfully!');
            setPopupSuccess(true);
            setIsPopupOpen(true);
        } catch {
            setPopupMessage('❌ Failed to save profile!');
            setPopupSuccess(false);
            setIsPopupOpen(true);
        }
    };

    const handleAvatarChange = e => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        setUser(u => ({ ...u, avatarUrl: URL.createObjectURL(file) }));
    };

    const togglePwdForm = () => {
        setShowPwdForm(x => !x);
        setPwdError('');
        setPwdData({ oldPassword: '', newPassword: '' });
    };

    const handlePwdChange = e => setPwdData({ ...pwdData, [e.target.name]: e.target.value });

    const savePassword = async e => {
        e.preventDefault();
        setPwdError('');
        try {
            await axios.put('/api/profile/password', pwdData, { headers: { Authorization: `Bearer ${token}` } });
            setPopupMessage('✅ Password changed successfully!');
            setPopupSuccess(true);
            setIsPopupOpen(true);
            togglePwdForm();
        } catch (err) {
            setPwdError(err.response?.data?.message || '❌ Failed to change password!');
        }
    };

    const deleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account?')) return;
        try {
            await axios.delete('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
            setPopupMessage('✅ Account deleted successfully!');
            setPopupSuccess(true);
            setIsPopupOpen(true);
            localStorage.removeItem('token');
            navigate('/login');
        } catch {
            setPopupMessage('❌ Failed to delete account!');
            setPopupSuccess(false);
            setIsPopupOpen(true);
        }
    };

    const calculateBMRAndSetGoals = async () => {
        // 1) Lấy thông tin từ user state
        const { age, gender, weight, height, activity_level, goal } = user;
        const w = parseFloat(weight);
        const h = parseFloat(height);
        const a = parseInt(age, 10);

        // Kiểm tra dữ liệu đầu vào bắt buộc
        if (!w || !h || !a || !gender || !activity_level || !goal) {
            setPopupMessage('❗ Please complete all personal info before auto calculation.');
            setPopupSuccess(false);
            setIsPopupOpen(true);
            return;
        }

        // 2) Tính BMR theo công thức Mifflin-St Jeor
        let bmr = gender === 'female'
            ? 10 * w + 6.25 * h - 5 * a - 161
            : 10 * w + 6.25 * h - 5 * a + 5;

        const activityFactors = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            "very active": 1.9
        };

        bmr *= activityFactors[activity_level] || 1.2;

        // 3) Điều chỉnh theo mục tiêu (giảm hoặc tăng 15%)
        if (goal === 'lose') {
            bmr *= 0.85;   // ~giảm 15%
        } else if (goal === 'gain') {
            bmr *= 1.15;   // ~tăng 15%
        }

        // 4) Tính ra calories và macros cuối
        const calories = Math.round(bmr);
        const protein = Math.round(w * 2); // 2g protein / kg cơ thể
        const fat = Math.round(w * 1);     // 1g fat / kg cơ thể
        const proteinCal = protein * 4;
        const fatCal = fat * 9;
        // carbs = (calories - proteinCal - fatCal) / 4  (lấy tối đa 0 nếu âm)
        const carbs = Math.max(
            0,
            Math.round((calories - proteinCal - fatCal) / 4)
        );

        const newGoal = { calories, protein, carbs, fat };

        // Lưu vào state để hiển thị ngay trên UI
        setNutritionGoal(newGoal);

        try {
            // 5) Gửi lên backend để lưu hoặc cập nhật vào bảng ke_hoach_dinh_duong
            await axios.post(
                '/api/nutrition-goal',
                newGoal,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 6) Sau khi lưu thành công, tạo notification mới với message + detail
            const notifMessage = 'Nutrition goal updated';
            const notifDetail =
                `Target of day:\n` +
                `• Calories: ${calories} kcal\n` +
                `• Protein: ${protein} g\n` +
                `• Carbs: ${carbs} g\n` +
                `• Fat: ${fat} g`;

            await axios.post(
                '/api/notifications',
                { message: notifMessage, detail: notifDetail },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 7) Bắn event để Header (hoặc các tab khác) biết có notification mới
            localStorage.setItem('new-notification', Date.now());

            // 8) Hiển thị popup thành công
            setPopupMessage('✅ Nutrition goal calculated and saved!');
            setPopupSuccess(true);
            setIsPopupOpen(true);

        } catch (err) {
            console.error('❌ Failed to save nutrition goal or notification:', err.message);
            setPopupMessage('❌ Failed to save nutrition goal to server.');
            setPopupSuccess(false);
            setIsPopupOpen(true);
        }
    };

    if (loading) return <p className="text-center mt-6">⏳ Loading...</p>;
    if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;

    return (
        <div className="profile-container row-layout">
            <div className="profile-info-panel">
                <div className="avatar-wrapper">
                    <img
                        src={user.avatarUrl || '/images/avt_default.png'}
                        alt="Avatar"
                        className="avatar-img"
                    />
                    {isEditing && (
                        <label className="avatar-upload-btn">
                            <FontAwesomeIcon icon={faCamera} />
                            <input type="file" accept="image/*" onChange={handleAvatarChange} />
                        </label>
                    )}
                </div>

                <div className="nutrition-goal-box">
                    <div className="goal-header">Nutrition Targets</div>
                    <div className="goal-grid edit-mode">
                        <div className="full-width">
                            <button type="button" className="auto-calc-btn" onClick={calculateBMRAndSetGoals}>
                                Auto Calculate Goal Stats
                            </button>
                            <p className="note-text">
                                Automatically generates your calorie and macros using BMR, activity, and goal.
                            </p>
                        </div>
                        <div>
                            <label>Calories</label>
                            <input
                                name="calories"
                                type="number"
                                className="profile-input"
                                value={nutritionGoal.calories || ''}
                                onChange={e => setNutritionGoal({ ...nutritionGoal, calories: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Protein (g)</label>
                            <input
                                name="protein"
                                type="number"
                                className="profile-input"
                                value={nutritionGoal.protein || ''}
                                onChange={e => setNutritionGoal({ ...nutritionGoal, protein: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Carbs (g)</label>
                            <input
                                name="carbs"
                                type="number"
                                className="profile-input"
                                value={nutritionGoal.carbs || ''}
                                onChange={e => setNutritionGoal({ ...nutritionGoal, carbs: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Fat (g)</label>
                            <input
                                name="fat"
                                type="number"
                                className="profile-input"
                                value={nutritionGoal.fat || ''}
                                onChange={e => setNutritionGoal({ ...nutritionGoal, fat: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className={`profile-left ${isEditing ? 'editing' : ''}`}>
                <div className="profile-header">
                    <h2 className="profile-title">My Profile</h2>
                    <button
                        onClick={() => {
                            setShowPwdForm(false);
                            setPwdError('');
                            setIsEditing(prev => !prev);
                        }}
                        className="repeat-btn"
                        title={isEditing ? 'Cancel edit' : 'Edit profile'}
                    >
                        {isEditing ? '✕' : '✎'}
                    </button>
                </div>

                {!isEditing ? (
                    <ul className="info-list">
                        <li><strong>Name:</strong> {user.name}</li>
                        <li><strong>Email:</strong> {user.email}</li>
                        <li><strong>Age:</strong> {user.age}</li>
                        <li><strong>Gender:</strong> {user.gender}</li>
                        <li><strong>Goal:</strong> {user.goal}</li>
                        <li><strong>Activity:</strong> {user.activity_level}</li>
                        <li><strong>Weight:</strong> {user.weight} kg</li>
                        <li><strong>Height:</strong> {user.height} cm</li>
                    </ul>
                ) : (
                    <form onSubmit={saveProfile} className="profile-form">
                        <input name="name" type="text" placeholder="Full Name" value={user.name} onChange={handleChange} className="profile-input" />
                        <input name="email" type="email" placeholder="Email" value={user.email} onChange={handleChange} className="profile-input" />

                        <div className="flex-row gap-2">
                            <div className="input-with-unit full-width">
                                <input name="age" type="number" placeholder="Age" value={user.age} onChange={handleChange} className="profile-input" />
                            </div>
                            <div className="input-with-unit full-width">
                                <select name="gender" value={user.gender} onChange={handleChange} className="profile-input" required>
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="input-with-unit full-width">
                                <input name="weight" type="number" placeholder="Weight" value={user.weight} onChange={handleChange} className="profile-input" />
                                <span className="unit-label">kg</span>
                            </div>
                            <div className="input-with-unit full-width">
                                <input name="height" type="number" placeholder="Height" value={user.height} onChange={handleChange} className="profile-input" />
                                <span className="unit-label">cm</span>
                            </div>
                        </div>

                        <div className="input-with-unit full-width">
                            <select name="goal" value={user.goal} onChange={handleChange} className="profile-input" required>
                                <option value="">Select Goal</option>
                                <option value="lose">Lose Weight</option>
                                <option value="maintain">Maintain Weight</option>
                                <option value="gain">Gain Weight</option>
                            </select>
                        </div>

                        <div className="input-with-unit full-width">
                            <select name="activity_level" value={user.activity_level} onChange={handleChange} className="profile-input" required>
                                <option value="">Select Activity Level</option>
                                <option value="sedentary">Sedentary – Little to no exercise</option>
                                <option value="light">Light – Light exercise/sports 1–3 days/week</option>
                                <option value="moderate">Moderate – Moderate exercise/sports 3–5 days/week</option>
                                <option value="active">Active – Hard exercise/sports 6–7 days/week</option>
                                <option value="very active">Very Active – Very hard exercise/sports & physical job</option>
                            </select>
                        </div>

                        {showPwdForm && (
                            <div className="profile-form" style={{ marginTop: '1rem' }}>
                                <div className="relative">
                                    <input
                                        name="oldPassword"
                                        type={showPwd.old ? 'text' : 'password'}
                                        placeholder="Current Password"
                                        value={pwdData.oldPassword}
                                        onChange={handlePwdChange}
                                        className="profile-input pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(prev => ({ ...prev, old: !prev.old }))}
                                        className="toggle-pwd-btn"
                                    >
                                        <FontAwesomeIcon icon={showPwd.old ? faEye : faEyeSlash} />
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        name="newPassword"
                                        type={showPwd.new ? 'text' : 'password'}
                                        placeholder="New Password"
                                        value={pwdData.newPassword}
                                        onChange={handlePwdChange}
                                        className="profile-input pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(prev => ({ ...prev, new: !prev.new }))}
                                        className="toggle-pwd-btn"
                                    >
                                        <FontAwesomeIcon icon={faEyeSlash} />
                                    </button>
                                </div>
                                {pwdError && <p className="text-red-500">{pwdError}</p>}
                                <button type="button" onClick={savePassword} className="profile-btn btn-password">Save Password</button>
                            </div>
                        )}

                        <div className="action-button-group justify-between">
                            <button onClick={deleteAccount} type="button" className="profile-btn btn-delete">
                                <FontAwesomeIcon icon={faTrashAlt} className="mr-2" /> Delete Account
                            </button>
                            <button type="submit" className="profile-btn btn-save">
                                <FontAwesomeIcon icon={faSave} className="mr-2" /> Save Profile
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <Popup open={isPopupOpen} message={popupMessage} success={popupSuccess} onClose={() => setIsPopupOpen(false)} />
        </div>
    );
};

export default Profile;