import React, { useState, useEffect } from 'react';

// Nutritionix API credentials (replace with yours)
// const APP_ID = '54ad9056';
// const API_KEY = 'fc86a343882b8a1f25a02bbd028f6c1c';

// Default target values
const targetValues = {
    energy: 1725,
    protein: 107.8,
    carbs: 194.1,
    fat: 57.5,
};

// Function to get start and end date by number of days
function getDateRange(days) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (parseInt(days) - 1));
    const format = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${format(start)} to ${format(end)}`;
}

const Report = () => {
    const [includeToday, setIncludeToday] = useState(true);
    const [includeSupplements, setIncludeSupplements] = useState(false);
    const [days, setDays] = useState('7');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Nutrition data state
    const [data, setData] = useState({
        consumed: 0,
        expenditure: 1725,
        remaining: 1725,
        protein: 0,
        carbs: 0,
        fat: 0,
    });

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch('/api/meals/report', {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                });
                const rows = await res.json();
                // Get recent meals by number of days
                const recent = rows.slice(0, parseInt(days));
                let total = { calo: 0, protein: 0, carb: 0, fat: 0 };
                let count = 0;
                recent.forEach(row => {
                    total.calo += (row.calo || 0) * (row.quantity || 1);
                    total.protein += (row.protein || 0) * (row.quantity || 1);
                    total.carb += (row.carb || 0) * (row.quantity || 1);
                    total.fat += (row.fat || 0) * (row.quantity || 1);
                    count++;
                });
                setData({
                    consumed: Math.round(total.calo / (count || 1)),
                    expenditure: 1725,
                    remaining: Math.max(0, 1725 - Math.round(total.calo / (count || 1))),
                    protein: Math.round(total.protein / (count || 1)),
                    carbs: Math.round(total.carb / (count || 1)),
                    fat: Math.round(total.fat / (count || 1)),
                });
            } catch (err) {
                setError('Unable to fetch data from the server!');
                setData({
                    consumed: 0, expenditure: 1725, remaining: 1725, protein: 0, carbs: 0, fat: 0
                });
            }
            setLoading(false);
        };
        fetchReport();
    }, [days, includeToday, includeSupplements, filter]);

    const targets = [
        { label: 'Energy', value: data.consumed, target: targetValues.energy, unit: 'kcal' },
        { label: 'Protein', value: data.protein, target: targetValues.protein, unit: 'g' },
        { label: 'Net Carbs', value: data.carbs, target: targetValues.carbs, unit: 'g' },
        { label: 'Fat', value: data.fat, target: targetValues.fat, unit: 'g' },
    ];

    return (
        <div className="min-h-screen bg-[#fdfaf4] py-8 px-2">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-1">
                    Nutrition Report <span className="inline-block align-top text-base text-gray-400">ⓘ</span>
                </h1>
                <p className="text-gray-500 mb-8">
                    View daily averages for a selected period of time.
                </p>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow p-8 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={includeToday}
                                onChange={() => setIncludeToday(!includeToday)}
                                className="accent-orange-500 w-5 h-5"
                                id="includeToday"
                            />
                            <label htmlFor="includeToday" className="font-semibold text-gray-700 text-lg">Include Today</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={includeSupplements}
                                onChange={() => setIncludeSupplements(!includeSupplements)}
                                className="accent-orange-500 w-5 h-5"
                                id="includeSupplements"
                            />
                            <label htmlFor="includeSupplements" className="text-gray-700 text-lg">Include Supplements</label>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <select
                            value={days}
                            onChange={e => setDays(e.target.value)}
                            className="border rounded px-3 py-2 focus:outline-none text-lg"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="14">Last 14 days</option>
                            <option value="30">Last 30 days</option>
                        </select>
                        <select
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            className="border rounded px-3 py-2 focus:outline-none text-lg"
                        >
                            <option value="all">All Days</option>
                            <option value="weekdays">Weekdays</option>
                            <option value="weekends">Weekends</option>
                        </select>
                    </div>
                </div>

                {/* Date Range */}
                <div className="text-center font-bold text-3xl mb-8">
                    {getDateRange(days)}
                </div>

                {/* Loading/Error */}
                {loading && <div className="text-center text-gray-500 mb-4">Loading data from Nutritionix...</div>}
                {error && <div className="text-center text-red-500 mb-4">{error}</div>}

                {/* Energy Summary */}
                <div className="bg-white rounded-2xl shadow p-8 mb-8 flex flex-col md:flex-row md:items-center gap-8">
                    <div className="flex-1 flex flex-row justify-center gap-10">
                        <CircleStat value={data.consumed} label="Consumed" color="gray" />
                        <CircleStat value={data.expenditure} label="Expenditure" color="purple" />
                        <CircleStat value={data.remaining} label="Remaining" color="gray" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="font-semibold text-gray-700 text-lg">TARGET</span>
                            <span className="text-xs text-gray-400">↗</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            {targets.map((t, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="w-32 text-gray-700 text-lg">{t.label}</div>
                                    <div className="flex-1 bg-gray-100 rounded h-3 relative">
                                        <div
                                            className="bg-gray-300 h-3 rounded"
                                            style={{ width: `${t.target === 0 ? 0 : (t.value / t.target * 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-40 text-right text-gray-500 text-md">
                                        {t.value} / {t.target} {t.unit} <span className="ml-2">{Math.round(t.target === 0 ? 0 : t.value / t.target * 100)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Circle stat component
function CircleStat({ value, label, color }) {
    let borderColor = "border-gray-300 text-gray-700";
    if (color === "purple") borderColor = "border-purple-400 text-purple-700";
    return (
        <div className="flex flex-col items-center">
            <div className={`w-24 h-24 rounded-full border-8 flex items-center justify-center text-2xl font-bold mb-2 ${borderColor}`}>
                {value}
            </div>
            <div className="text-gray-500 text-md">{label}</div>
        </div>
    );
}

export default Report;
