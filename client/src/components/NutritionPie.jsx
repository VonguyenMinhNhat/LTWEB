// src/components/NutritionPie.jsx
import React from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const NutritionPie = ({ data }) => {
    const { calories, protein, carbs, fat } = data;
    const total = calories + protein + carbs + fat;

    // Nếu tổng = 0, tạo một dataset màu xám
    const pieData = total === 0
        ? {
            labels: ['No Data'],
            datasets: [
                {
                    data: [1],
                    backgroundColor: ['#d1d5db'],  // gray-300
                    hoverOffset: 4
                }
            ]
        }
        : {
            labels: ['Calories', 'Protein', 'Carbs', 'Fat'],
            datasets: [
                {
                    data: [calories, protein, carbs, fat],
                    backgroundColor: [
                        '#f97316', // orange
                        '#10b981', // green
                        '#3b82f6', // blue
                        '#facc15'  // yellow
                    ],
                    hoverOffset: 1
                }
            ]
        };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    // ẩn legend khi chưa có data
                    filter: ctx => total > 0
                }
            },
            tooltip: {
                callbacks: {
                    label: ctx => {
                        if (total === 0) return 'No data';
                        const label = ctx.label || '';
                        const value = ctx.parsed;
                        return `${label}: ${value}`;
                    }
                }
            }
        }
    };

    return (
        <div style={{ width: '100%', height: '250px' }}>
            <Pie data={pieData} options={options} />
        </div>
    );
};

export default NutritionPie;
