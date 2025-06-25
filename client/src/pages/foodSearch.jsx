// src/pages/FoodSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faMinus, faTrash, faXmark, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { searchFood } from '../api/food';
import NutritionPie from '../components/NutritionPie';
import '../styles/foodSearch.css';
//Import lịch ngày/tháng/năm
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
//Import cảnh báo popup
import Popup from '../components/Popup';

function scaleNutrition(food) {
    const weight = Number(food.custom_weight);
    const baseWeight = food.serving_weight_grams || 100;
    if (!weight || weight <= 0 || !baseWeight) return food;
    const ratio = weight / baseWeight;
    return {
        ...food,
        nf_calories: Number((food.nf_calories * ratio).toFixed(2)),
        nf_protein: Number((food.nf_protein * ratio).toFixed(2)),
        nf_total_carbohydrate: Number((food.nf_total_carbohydrate * ratio).toFixed(2)),
        nf_total_fat: Number((food.nf_total_fat * ratio).toFixed(2)),
    };
}

function normalizeTo100g(food) {
    const gram = food.serving_weight_grams || 100;

    const ratio = 100 / gram;

    return {
        ...food,
        nf_calories: Number((food.nf_calories * ratio).toFixed(2)),
        nf_protein: Number((food.nf_protein * ratio).toFixed(2)),
        nf_total_carbohydrate: Number((food.nf_total_carbohydrate * ratio).toFixed(2)),
        nf_total_fat: Number((food.nf_total_fat * ratio).toFixed(2)),
        serving_weight_grams: 100 // chuẩn hóa luôn về 100g
    };
}
const FoodSearch = () => {
    const [q, setQ] = useState('');
    const [results, setResults] = useState([]);
    const [history, setHistory] = useState([]);
    const [detail, setDetail] = useState(null);
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [existingFoods, setExistingFoods] = useState([]);
    const [selectedDescription, setSelectedDescription] = useState(null);
    const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [popup, setPopup] = useState({ open: false, message: '', success: true });
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const wrapperRef = useRef(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // 1) Redirect nếu không có token
    useEffect(() => {
        if (!token) navigate('/login');
    }, [navigate, token]);

    // 2) Load lịch sử tìm kiếm
    useEffect(() => {
        if (!token) return;
        axios.get('/api/history', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setHistory(res.data))
            .catch(() => { });
    }, [token]);

    // 3) Load danh sách món có sẵn từ DB
    useEffect(() => {
        if (!token) return;
        (async () => {
            try {
                const res = await axios.get('/api/foods', { headers: { Authorization: `Bearer ${token}` } });
                setExistingFoods(res.data);
            } catch { }
        })();
    }, [token]);

    // 4) Click ngoài dropdown sẽ đóng
    useEffect(() => {
        const onClick = e => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    // 5) Recompute totals khi selectedFoods thay đổi
    useEffect(() => {
        const sums = selectedFoods.reduce((acc, f) => {
            const usedGram = f.custom_weight ?? 100;
            const quantity = f.quantity ?? 1;

            // Đưa về dữ liệu gốc 100g (nếu dữ liệu từ API là theo 189g chẳng hạn)
            const gramPerServing = f.serving_weight_grams || 100;

            const caloPer100g = (f.nf_calories || 0) / gramPerServing * 100;
            const proteinPer100g = (f.nf_protein || 0) / gramPerServing * 100;
            const carbPer100g = (f.nf_total_carbohydrate || 0) / gramPerServing * 100;
            const fatPer100g = (f.nf_total_fat || 0) / gramPerServing * 100;

            const factor = usedGram * quantity / 100;

            return {
                calories: acc.calories + caloPer100g * factor,
                protein: acc.protein + proteinPer100g * factor,
                carbs: acc.carbs + carbPer100g * factor,
                fat: acc.fat + fatPer100g * factor,
            };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

        setTotals({
            calories: Math.round(sums.calories * 100) / 100,
            protein: Math.round(sums.protein * 100) / 100,
            carbs: Math.round(sums.carbs * 100) / 100,
            fat: Math.round(sums.fat * 100) / 100,
        });
    }, [selectedFoods]);

    // 6) Thêm effect để tải các món ăn theo ngày đã chọn
    useEffect(() => {
        if (!token || !selectedDate) return;
        const fetchMealByDate = async () => {
            const dateStr = selectedDate.toISOString().slice(0, 10);
            try {
                // 1) Lấy danh sách món từ lịch sử
                const { data } = await axios.get('/api/meals', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { date: dateStr }
                });
                // data.items = [ { food_name, quantity, custom_weight } ]

                // 2) Fetch dinh dưỡng cho từng món
                const enriched = await Promise.all(
                    data.items.map(async item => {
                        // Gọi endpoint /api/foods/fetch để lấy dinh dưỡng chuẩn 100g
                        const res = await axios.post('/api/foods/fetch',
                            { food_name: item.food_name, weight: 100 },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        return {
                            ...item,
                            quantity: item.quantity ?? 1,
                            custom_weight: item.custom_weight ?? 100,
                            // trường nutrition từ backend
                            nf_calories: res.data.nf_calories,
                            nf_protein: res.data.nf_protein,
                            nf_total_carbohydrate: res.data.nf_total_carbohydrate,
                            nf_total_fat: res.data.nf_total_fat,
                            serving_weight_grams: res.data.serving_weight_grams
                        };
                    })
                );

                setSelectedFoods(enriched);
            } catch {
                setSelectedFoods([]);
            }
            setResults([]);
        };
        fetchMealByDate();
    }, [selectedDate, token]);

    // 7) Xử lý search form
    const handleSearch = async e => {
        e.preventDefault();
        if (!q.trim()) return;
        setShowDropdown(false);
        try {
            const foods = await searchFood(q);
            setResults(foods.map(normalizeTo100g));
            // Cập nhật lịch sử, loại trùng
            await axios.post('/api/history', { query: q }, { headers: { Authorization: `Bearer ${token}` } });
            setHistory(h => {
                const exists = h.find(item => item.query.toLowerCase() === q.toLowerCase());
                if (exists) {
                    return [
                        { ...exists, id: Date.now() },
                        ...h.filter(i => i.query.toLowerCase() !== q.toLowerCase())
                    ];
                }
                return [{ id: Date.now(), query: q }, ...h];
            });

        } catch { }
        setDetail(null);
    };

    // 8) Thêm món vào selectedFoods (tăng quantity nếu đã có)
    const handleAddFood = food => {
        const key = food.nix_item_id || food.food_name;
        setSelectedFoods(prev => {
            const ex = prev.find(f => (f.nix_item_id || f.food_name) === key);
            if (ex) {
                return prev.map(f =>
                    (f.nix_item_id || f.food_name) === key
                        ? { ...f, quantity: f.quantity + 1 }
                        : f
                );
            }
            return [...prev, { ...food, quantity: 1 }];
        });
        setShowDropdown(false);
    };

    // 9) Tăng/giảm số lượng đã chọn
    const handleChangeQuantity = (key, delta) => {
        setSelectedFoods(prev =>
            prev.map(f =>
                (f.nix_item_id || f.food_name) === key
                    ? { ...f, quantity: Math.max(1, f.quantity + delta) }
                    : f
            )
        );
    };

    // 10) Chọn lại từ lịch sử
    const handleSelectHistory = item => {
        setQ(item.query);
        setShowDropdown(false);
        setTimeout(() => {
            wrapperRef.current.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true }));
        }, 0);
    };

    // 11) Xóa khỏi lịch sử
    const handleDeleteHistory = async id => {
        await axios.delete(`/api/history/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setHistory(h => h.filter(i => i.id !== id));
    };

    // 12) Lưu bữa ăn
    const handleSaveMeal = async () => {
        if (!selectedFoods.length) {
            return setPopup({
                open: true,
                message: '❗ There are no meals to save yet!',
                success: false
            });
        }

        const dateStr = selectedDate.toISOString().slice(0, 10);

        try {
            // 1) Kiểm tra xem bữa ăn của ngày đó đã tồn tại chưa
            const { data: existing } = await axios.get('/api/meals', {
                headers: { Authorization: `Bearer ${token}` },
                params: { date: dateStr }
            });

            const method = existing.items.length ? 'put' : 'post';
            const url = '/api/meals';

            const payload = {
                date: dateStr,
                items: selectedFoods.map(f => {
                    const scaled = scaleNutrition(f);
                    return {
                        food_name: scaled.food_name,
                        quantity: scaled.quantity ?? 1,
                        custom_weight: scaled.custom_weight ?? 100,
                        nf_calories: scaled.nf_calories,
                        nf_protein: scaled.nf_protein,
                        nf_total_carbohydrate: scaled.nf_total_carbohydrate,
                        nf_total_fat: scaled.nf_total_fat
                    };
                })
            };

            // Gửi lên server POST/PUT /api/meals
            await axios[method](url, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 2) Sau khi lưu bữa, fetch goal & summary
            const [resGoal, resSum] = await Promise.all([
                axios.get('/api/profile-goal', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/nutrition-summary', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { date: dateStr }
                })
            ]);

            const { calo_goal, protein_goal, carb_goal, fat_goal } = resGoal.data;
            // resSum.data có { calo, protein, carb, fat }
            const {
                calo: totalCalories,
                protein: totalProtein,
                carb: totalCarbs,
                fat: totalFat
            } = resSum.data;

            // 3) Tính phần vượt/thấp
            const warnings = [];
            if (totalCalories > calo_goal) {
                warnings.push(`Calories: ${totalCalories} kcal > ${calo_goal} kcal`);
            }
            if (totalProtein > protein_goal) {
                warnings.push(`Protein: ${totalProtein} g > ${protein_goal} g`);
            }
            if (totalCarbs > carb_goal) {
                warnings.push(`Carbs: ${totalCarbs} g > ${carb_goal} g`);
            }
            if (totalFat > fat_goal) {
                warnings.push(`Fat: ${totalFat} g > ${fat_goal} g`);
            }

            // 4) Tính ratio macronutrient
            let proteinCal = totalProtein * 4;
            let carbCal = totalCarbs * 4;
            let fatCal = totalFat * 9;

            // Nếu do làm tròn, tổng calo macro vượt tổng calo, ép lại
            if (proteinCal > totalCalories) proteinCal = totalCalories;
            if (carbCal > totalCalories) carbCal = totalCalories;
            if (fatCal > totalCalories) fatCal = totalCalories;

            let proteinRatio = 0,
                carbRatio = 0,
                fatRatio = 0;
            if (totalCalories > 0) {
                proteinRatio = (proteinCal / totalCalories) * 100;
                carbRatio = (carbCal / totalCalories) * 100;
                fatRatio = (fatCal / totalCalories) * 100;
            }

            if (totalCalories > 0) {
                if (proteinRatio < 10 || proteinRatio > 35) {
                    warnings.push(
                        `Protein ratio: ${proteinRatio.toFixed(0)}% (Recommended 10‒35%)`
                    );
                }
                if (carbRatio < 45 || carbRatio > 65) {
                    warnings.push(
                        `Carbs ratio: ${carbRatio.toFixed(0)}% (Recommended 45‒65%)`
                    );
                }
                if (fatRatio < 20 || fatRatio > 35) {
                    warnings.push(
                        `Fat ratio: ${fatRatio.toFixed(0)}% (Recommended 20‒35%)`
                    );
                }
            }

            // 5) Tạo popup và thông báo
            if (warnings.length > 0) {
                // --- A) Popup hiển thị message ngắn gọn ---
                setPopup({
                    open: true,
                    message:
                        '❗ Your meal exceeds your nutrition goals. Tap the bell icon for details.',
                    success: false
                });

                // --- B) Gửi notification lên backend, format detail gọn hơn ---
                try {
                    // Dùng dấu • để gạch đầu dòng, xuống dòng giữa các item
                    const detailText =
                        warnings.map(w => `• ${w}`).join('\n');

                    await axios.post(
                        '/api/notifications',
                        {
                            message: 'Your meal exceeds your nutrition goals!',
                            detail: detailText
                        },
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );

                    // Bắn event để Header lắng nghe
                    localStorage.setItem('new-notification', Date.now());
                } catch (err) {
                    console.error('Error sending notification:', err);
                }
            } else {
                // Nếu không có cảnh báo, thông báo thành công
                setPopup({
                    open: true,
                    message: '✅ Meal saved and within nutritional goals!',
                    success: true
                });
            }
        } catch (err) {
            console.error('Error in handleSaveMeal:', err);
            setPopup({
                open: true,
                message: '❌ Unable to save! Please try again.',
                success: false
            });
        }
    };

    // 13) Chọn món có sẵn
    const handleSelectExisting = async (name) => {
        setSelectedDescription(name);
        setQ(name);
        setShowDropdown(false);

        // 1) tìm món
        const selected = existingFoods.find(item => item.ten_mon === name);
        if (!selected) return;

        // 2) Gọi backend của bạn (PUT /api/foods/fetch) để fetch nutrition 100g
        try {
            const { data: apiFood } = await axios.post(
                '/api/foods/fetch',
                { food_name: selected.ten_mon, weight: 100 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // apiFood = { food_name, serving_weight_grams:100, nf_calories, nf_protein, ... }

            setResults(prev => {
                const key = apiFood.food_name;
                if (prev.some(f => (f.nix_item_id || f.food_name) === key)) return prev;
                return [apiFood, ...prev];
            });
        } catch (err) {
            console.error('Fetch nutritionix failed', err);
        }
    };

    const filteredHistory = q.trim()
        ? history.filter(h => h.query.toLowerCase().includes(q.toLowerCase()))
        : [];

    // 14) Chọn ngày hôm trước
    const handlePrevDay = () => {
        const prevDate = new Date(selectedDate);
        prevDate.setDate(prevDate.getDate() - 1);
        setSelectedDate(prevDate);
    };

    // 15) Chọn ngày hôm sau
    const handleNextDay = () => {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        setSelectedDate(nextDate);
    };

    // 16) Lọc món trùng tên
    const uniqueFoods = existingFoods
        .filter(i => i.ten_mon)
        .reduce((acc, item) => {
            const key = item.ten_mon.trim().toLowerCase();
            if (!acc.map.has(key)) {
                acc.map.set(key, true);
                acc.list.push(item);
            }
            return acc;
        }, { map: new Map(), list: [] }).list;

    // 17) Tính theo gam món
    const handleChangeWeight = (key, newWeightStr) => {
        const newWeight = Math.max(1, parseFloat(newWeightStr) || 0);
        setSelectedFoods(prev =>
            prev.map(f => {
                const fKey = f.nix_item_id || f.food_name;
                if (fKey === key) {
                    return { ...f, custom_weight: newWeight };
                }
                return f;
            })
        );
    };

    return (
        <div className="food-search-container">
            <h1 className="food-search-title">Search Food</h1>

            {/* Search + dropdown lịch sử */}
            <div ref={wrapperRef} className="food-search-wrapper">
                <form onSubmit={handleSearch} className="food-search-form">
                    <input
                        type="text"
                        value={q}
                        onChange={e => {
                            setQ(e.target.value);
                            setShowDropdown(e.target.value.trim().length > 0);
                        }}
                        placeholder="Ex: 1 apple, 200g rice..."
                        className="food-search-input"
                    />
                    <button type="submit" className="food-search-icon-btn">
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </form>

                {showDropdown && filteredHistory.length > 0 && results.length === 0 && (
                    <ul className="history-dropdown">
                        {filteredHistory.map(item => (
                            <li
                                key={item.id}
                                className="history-item"
                                onClick={() => handleSelectHistory(item)}
                            >
                                <span>{item.query}</span>
                                <button
                                    className="history-delete-btn"
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleDeleteHistory(item.id);
                                    }}
                                    title="Remove from history"
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Grid layout */}
            <div className="grid-container">

                {/* Selected Foods Panel */}
                <div className="selected-list-panel">
                    <div className="selected-panel-top">
                        <h3 className="panel-header">Selected food</h3>
                        <div className="meal-date-picker-fixed">
                            <button onClick={handlePrevDay} className="date-nav-btn">
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <DatePicker
                                selected={selectedDate}
                                onChange={date => setSelectedDate(date)}
                                dateFormat="dd/MM/yyyy"
                                className="date-input"
                            />
                            <button onClick={handleNextDay} className="date-nav-btn">
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    </div>

                    <ul className="selected-foods-list">
                        {selectedFoods.map((f, i) => {
                            const key = f.nix_item_id || f.food_name;
                            return (
                                <li
                                    key={`${key}-${i}`}
                                    className="selected-item"
                                    onClick={() => {
                                        setResults(prev => {
                                            const exists = prev.some(
                                                item => (item.nix_item_id || item.food_name) === key
                                            );
                                            return exists ? prev : [f, ...prev];
                                        });
                                    }}
                                >
                                    <div className="selected-item-inner">
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <span>
                                                {f.food_name} <strong>× {f.quantity}</strong> (
                                                {f.custom_weight ?? f.serving_weight_grams ?? 100}g)
                                            </span>
                                        </div>

                                        <div className="qty-controls">
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleChangeQuantity(key, -1);
                                                }}
                                            >
                                                −
                                            </button>
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleChangeQuantity(key, 1);
                                                }}
                                            >
                                                +
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                placeholder={`${f.serving_weight_grams ?? 100}g`}
                                                value={f.custom_weight ?? ''}
                                                onClick={e => e.stopPropagation()}
                                                onChange={e => handleChangeWeight(key, e.target.value)}
                                                style={{
                                                    width: '70px',
                                                    padding: '2px 6px',
                                                    marginLeft: '0.5rem'
                                                }}
                                            />
                                            <span style={{ marginLeft: '0.25rem' }}>(g)</span>
                                            <button
                                                className="delete-btn"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    setSelectedFoods(prev =>
                                                        prev.filter(
                                                            x =>
                                                                (x.nix_item_id || x.food_name) !== key
                                                        )
                                                    );
                                                }}
                                                title="Xóa"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <button
                        className="btn-save-meal"
                        onClick={handleSaveMeal}
                    >
                        Save meal
                    </button>

                    {popup.open && (
                        <Popup
                            open={popup.open}
                            message={popup.message}
                            success={popup.success}
                            onClose={() => setPopup({ ...popup, open: false })}
                        />
                    )}
                </div>

                {/* Totals + Pie */}
                <div className="totals-panel">
                    <div className="totals-panel-top">
                        <h3 className="panel-header">Total nutrition</h3>
                    </div>

                    <ul className="totals-nutrients-list">
                        {['calories', 'protein', 'carbs', 'fat'].map(n => (
                            <li key={n} className="nutrient-line">
                                <span className={`dot dot-${n}`} />
                                <span className="nutrient-label">
                                    {n.charAt(0).toUpperCase() + n.slice(1)}:
                                </span>
                                <strong>
                                    {n === 'calories'
                                        ? `${totals[n].toFixed(2)} kcal`
                                        : `${totals[n].toFixed(2)} g`}
                                </strong>
                            </li>
                        ))}
                    </ul>

                    {/* Pie chart vẫn để nguyên, nhưng sẽ nằm ở dưới cùng, bên ngoài <ul> */}
                    <div style={{ padding: '1rem' }}>
                        <NutritionPie data={totals} />
                    </div>
                </div>
            </div>

            {/* Search Results */}
            <div className="search-results">
                {results.map((food, i) => {
                    const key = food.nix_item_id || food.food_name;
                    return (
                        <div
                            key={`${key}-${i}`}
                            className="food-card"
                        >
                            <h2>{food.food_name}</h2>
                            <p>Calo: {food.nf_calories} kcal</p>
                            <p>Protein: {food.nf_protein} g</p>
                            <p>Carbs: {food.nf_total_carbohydrate} g</p>
                            <p>Fat: {food.nf_total_fat} g</p>

                            <div className="food-card-actions">
                                {/* Nút xóa (−) */}
                                <button
                                    className="remove-result-btn"
                                    title="Remove from results"
                                    onClick={() => {
                                        setResults(prev =>
                                            prev.filter(item =>
                                                (item.nix_item_id || item.food_name) !== key
                                            )
                                        );
                                    }}
                                >
                                    <FontAwesomeIcon icon={faMinus} />
                                </button>

                                {/* Nút thêm (+) */}
                                <button
                                    className="add-food-btn"
                                    onClick={() => handleAddFood(food)}
                                    title="Add to meal"
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>


            {/* Existing Foods Table */}
            <div className="existing-foods-table-container">
                <h3 className="panel-header">Available dish</h3>
                <table className="existing-foods-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Source</th>
                        </tr>
                    </thead>
                    <tbody>
                        {uniqueFoods.map(item => (
                            <tr
                                key={item.id}
                                className={`existing-food-row${selectedDescription === item.ten_mon ? ' selected' : ''}`}
                                onClick={() => handleSelectExisting(item.ten_mon)}
                            >
                                <td>{item.ten_mon}</td>
                                <td>NCDB</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

};

export default FoodSearch;