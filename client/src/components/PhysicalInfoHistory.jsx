import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const PhysicalInfoHistory = ({ reloadTrigger }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistory = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('⚠️ Login token not found.');
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get('http://localhost:5000/api/physicalInfo/history', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && Array.isArray(res.data)) {
                setHistory(res.data);
            } else {
                setError('⚠️ No history data available.');
            }
        } catch (err) {
            console.error('❌ Error loading history:', err);
            setError('❌ Failed to load data from server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        // eslint-disable-next-line
    }, [reloadTrigger]);

    if (loading) return <p className="text-blue-500">🔄 Loading history...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (history.length === 0) return <p className="text-gray-500">📭 No historical data available.</p>;

    // Prepare chart data
    const chartData = {
        labels: history.map(item => new Date(item.recorded_at || item.recordedAt).toLocaleDateString()).reverse(),
        datasets: [
            {
                label: 'Weight (kg)',
                data: history.map(item => item.weight).reverse(),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'BMI',
                data: history.map(item => item.bmi).reverse(),
                borderColor: 'rgb(153, 102, 255)',
                tension: 0.1
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        label += context.parsed.y;
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false
            }
        }
    };

    return (
        <div>
            <h2 className="text-lg font-bold mb-4">📊 Physical Information History</h2>

            <div className="h-64 mb-6">
                <Line data={chartData} options={options} />
            </div>

            <div className="space-y-3">
                {history.slice(0, 5).map((record, index) => (
                    <div key={index} className="border-b pb-2">
                        <p className="text-sm text-gray-500">
                            {new Date(record.recorded_at || record.recordedAt).toLocaleString()}
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-sm mt-1">
                            <p><span className="font-medium">⚖️ Weight:</span> {record.weight}kg</p>
                            <p><span className="font-medium">📏 Height:</span> {record.height}cm</p>
                            <p><span className="font-medium">🧮 BMI:</span> {record.bmi}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PhysicalInfoHistory;
