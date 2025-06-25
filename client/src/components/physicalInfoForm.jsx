import React, { useEffect, useState } from 'react';
import usePhysicalInfo from '../hooks/usePhysicalInfo';

const PhysicalInfoForm = ({ onAssess }) => {
  const [status, setStatus] = useState('');
  const { info, handleChange, handleSubmit, loading, healthStats } = usePhysicalInfo(setStatus);

  // Gọi lại hàm nhận xét khi có healthStats
  useEffect(() => {
  if (
    onAssess &&
    healthStats?.bmi &&
    healthStats?.dailyCalorieNeeds &&
    info.height && info.weight && info.age && info.gender && info.activityLevel
  ) {
    onAssess({
      height: info.height,
      weight: info.weight,
      age: info.age,
      gender: info.gender,
      activityLevel: info.activityLevel,
      bmi: healthStats.bmi,
      calories: healthStats.dailyCalorieNeeds,
    });
  }
}, [healthStats, info, onAssess]);

  const getBMIColor = (bmi) => {
    if (!bmi) return '';
    if (bmi < 18.5) return 'text-yellow-600';
    if (bmi < 25) return 'text-green-600';
    if (bmi < 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getActivityLevelDescription = () => {
    switch (info.activityLevel) {
      case 'Low': return 'Little or no physical activity';
      case 'Moderate': return 'Light exercise 1–3 times/week';
      case 'High': return 'Heavy exercise 3–5 times/week';
      default: return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Physical Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Height (cm)</label>
          <input
            type="number"
            name="height"
            value={info.height}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            min="100"
            max="250"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={info.weight}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            min="30"
            max="200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Age</label>
          <input
            type="number"
            name="age"
            value={info.age}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            min="10"
            max="120"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select
            name="gender"
            value={info.gender}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Activity Level</label>
          <select
            name="activityLevel"
            value={info.activityLevel}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select activity level</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>
          {info.activityLevel && (
            <p className="text-xs text-gray-500 mt-1">{getActivityLevelDescription()}</p>
          )}
        </div>
      </div>

      {/* Health Stats Section */}
      {healthStats.bmi && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">Health Metrics</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm">BMI:</p>
              <p className={`text-xl font-bold ${getBMIColor(healthStats.bmi)}`}>
                {healthStats.bmi} <span className="text-sm">({healthStats.bmiCategory})</span>
              </p>
            </div>

            <div>
              <p className="text-sm">Ideal Weight:</p>
              <p className="text-lg font-semibold">
                {healthStats.idealWeightRange.min} - {healthStats.idealWeightRange.max} kg
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-sm">Daily Calorie Needs:</p>
              <p className="text-lg font-semibold">
                {healthStats.dailyCalorieNeeds} kcal
              </p>
            </div>
          </div>

          {/* Các cảnh báo giữ nguyên */}
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Save Information'}
        </button>
        {status && <p className={`mt-2 ${status.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>{status}</p>}
      </div>
    </form>
  );
};

export default PhysicalInfoForm;
