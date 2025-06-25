import { useEffect, useState } from 'react';
import axios from 'axios';

const usePhysicalInfo = (onStatusChange) => {
  const [info, setInfo] = useState({ 
    height: '', 
    weight: '', 
    age: '', 
    gender: '', 
    activityLevel: '' 
  });
  const [loading, setLoading] = useState(true);
  const [healthStats, setHealthStats] = useState({
    bmi: null,
    bmiCategory: '',
    idealWeightRange: { min: 0, max: 0 },
    dailyCalorieNeeds: 0
  });

  useEffect(() => {
    const fetchInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/physicalInfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          setInfo(res.data);
          calculateHealthStats(res.data);
        }
      } catch (err) {
        console.error('❌ Lỗi tải thông tin:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInfo();
  }, []);

  const calculateHealthStats = (data) => {
    if (!data.height || !data.weight || !data.age || !data.gender || !data.activityLevel) return;
    
    const heightInM = data.height / 100;
    const bmi = data.weight / (heightInM * heightInM);
    
    // Tính khoảng cân nặng lý tưởng (BMI 18.5-24.9)
    const minIdealWeight = 18.5 * (heightInM * heightInM);
    const maxIdealWeight = 24.9 * (heightInM * heightInM);
    
    // Tính nhu cầu calo hàng ngày (Harris-Benedict)
    let bmr;
    if (data.gender === 'Nam') {
      bmr = 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age);
    } else {
      bmr = 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
    }
    
    const activityMultiplier = {
      'Ít': 1.2,
      'Trung bình': 1.55,
      'Nhiều': 1.725
    }[data.activityLevel] || 1.2;
    
    const dailyCalories = Math.round(bmr * activityMultiplier);
    
    // Xác định loại BMI
    const bmiCategory = 
      bmi < 18.5 ? 'Thiếu cân' :
      bmi < 25 ? 'Bình thường' :
      bmi < 30 ? 'Thừa cân' : 'Béo phì';
    
    setHealthStats({
      bmi: bmi.toFixed(1),
      bmiCategory,
      idealWeightRange: {
        min: minIdealWeight.toFixed(1),
        max: maxIdealWeight.toFixed(1)
      },
      dailyCalorieNeeds: dailyCalories
    });
  };

  const handleChange = (e) => {
    const newInfo = { ...info, [e.target.name]: e.target.value };
    setInfo(newInfo);
    
    if (['height', 'weight', 'age', 'gender', 'activityLevel'].includes(e.target.name)) {
      calculateHealthStats(newInfo);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onStatusChange('🔄 Đang lưu...');
    const token = localStorage.getItem('token');
    if (!token) {
      onStatusChange('❌ Không có token xác thực!');
      return;
    }

    try {
      // Chuyển đổi kiểu dữ liệu trước khi gửi
      const payload = {
        ...info,
        height: Number(info.height),
        weight: Number(info.weight),
        age: Number(info.age)
      };
      const res = await axios.post('http://localhost:5000/api/physicalInfo', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Phản hồi từ server:', res.data);

      if (res.status === 200) {
        onStatusChange('✅ Đã lưu thông tin thành công!');
        // Nếu muốn lưu lịch sử chỉ khi thành công:
        // await axios.post('http://localhost:5000/api/physicalInfo/history', ...);
      } else {
        onStatusChange('❌ Lưu thất bại!');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        onStatusChange('❌ ' + err.response.data.message);
      } else {
        onStatusChange('❌ Lưu thất bại!');
      }
      console.error('❌ Lỗi chi tiết:', err);
    }
  };

  return { info, handleChange, handleSubmit, loading, healthStats };
};

export default usePhysicalInfo;
