import React, { useState, useEffect } from 'react';
import 'chart.js/auto';          // Auto-register Chart.js
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

const TDEE = 2000;

const Dashboard = () => {
    const navigate = useNavigate();
    const [energyHistory, setEnergyHistory] = useState([]);
    const [initialWeight, setInitialWeight] = useState(60);
    const [loading, setLoading] = useState(true);

    // Redirect to login if not logged in
    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/login');
    }, [navigate]);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                // Get user profile
                const u = await fetch('/api/profile', {
                    headers: { Authorization: 'Bearer ' + token }
                }).then(r => r.json());
                setInitialWeight(u.weight || 60);

                // Get energy history
                const e = await fetch('/api/meals/energy-history', {
                    headers: { Authorization: 'Bearer ' + token }
                }).then(r => r.json());
                setEnergyHistory(e);
            } catch (err) {
                console.error(err);
                setEnergyHistory([]);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // Prepare data for chart
    const dates = energyHistory.map(e => e.date);
    const energyMap = Object.fromEntries(energyHistory.map(e => [e.date, e.consumed]));

    let acc = 0;
    const weightArr = dates.map(d => {
        const delta = (energyMap[d] || 0) - TDEE;
        acc += delta;
        const w = initialWeight + acc / 7700;
        return { date: d, weight: Math.round(w * 100) / 100 };
    });
    const weightMap = Object.fromEntries(weightArr.map(w => [w.date, w.weight]));

    // Prepare data for Chart.js
    const chartData = {
        labels: dates,
        datasets: [
            {
                label: 'Energy (kcal)',
                data: dates.map(d => energyMap[d] || 0),
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                tension: 0.3,
                yAxisID: 'y',
            },
            {
                label: 'Weight (kg)',
                data: dates.map(d => weightMap[d]),
                borderColor: 'rgba(255,99,132,1)',
                backgroundColor: 'rgba(255,99,132,0.2)',
                tension: 0.3,
                yAxisID: 'y1',
            }
        ]
    };

    const options = {
        maintainAspectRatio: false,
        scales: {
            y: { title: { display: true, text: 'kcal' } },
            y1: {
                beginAtZero: false,
                position: 'right',
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'kg' }
            }
        }
    };

    return (
        <div className="dashboard-container bg-gray-100 min-h-screen py-6 px-4 overflow-x-hidden box-border">
            <div className="max-w-7xl mx-auto space-y-8">
                <h1 className="text-2xl font-semibold">Dashboard</h1>

                {loading
                    ? <div className="text-center text-gray-500">Loading...</div>
                    : (
                        <>
                            {/* Chart */}
                            <div className="bg-white rounded-xl shadow p-4 h-96 overflow-x-auto">
                                <h2 className="font-medium mb-2">Energy & Weight</h2>
                                <Line data={chartData} options={options} />
                            </div>

                            {/* Data Table */}
                            <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
                                <h2 className="font-medium mb-2">Summary Table</h2>
                                <table className="min-w-full text-center border">
                                    <thead>
                                        <tr>
                                            <th className="border px-4 py-2">Date</th>
                                            <th className="border px-4 py-2">Kcal</th>
                                            <th className="border px-4 py-2">Kg</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dates.map((d, i) => (
                                            <tr key={i}>
                                                <td className="border px-4 py-2">{d}</td>
                                                <td className="border px-4 py-2">{energyMap[d] || 0}</td>
                                                <td className="border px-4 py-2">{weightMap[d]}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )
                }
            </div>
        </div>
    );
};

export default Dashboard;
