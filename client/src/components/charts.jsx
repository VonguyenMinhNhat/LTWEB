import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

// Đăng ký các thành phần của Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Charts = () => {
    const energyData = {
        labels: ["8 Apr", "10 Apr", "12 Apr", "14 Apr"],
        datasets: [
            {
                label: "Calories Consumed (kcal)",
                data: [1600, 1800, 1500, 1750],
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.4
            }
        ]
    };

    const weightData = {
        labels: ["8 Apr", "10 Apr", "12 Apr", "14 Apr"],
        datasets: [
            {
                label: "Weight (kg)",
                data: [60, 59.8, 59.5, 59.7],
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                tension: 0.4
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, 
        plugins: {
            legend: { position: "top" },
            title: { display: false }
        }
    };

    return (
        <div className="w-full space-y-10 p-6">
            <div className="bg-white p-6 rounded-xl shadow w-full">
                <h3 className="text-xl font-semibold mb-4">Calories Consumed</h3>
                <div className="w-full h-[300px]">
                    <Line data={energyData} options={options} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow w-full">
                <h3 className="text-xl font-semibold mb-4">Weight Change</h3>
                <div className="w-full h-[300px]">
                    <Line data={weightData} options={options} />
                </div>
            </div>
        </div>
    );
};

export default Charts;
