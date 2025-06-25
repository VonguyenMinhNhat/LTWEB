﻿// src/api/food.jsx
export async function searchFood(query) {
    // Gọi backend ASP.NET Core thay vì Nutritionix trực tiếp
    const res = await fetch('/api/food/nutritionix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Nutrition API lỗi ${res.status}: ${text}`);
    }
    // Kết quả đã enrich từ backend
    return await res.json();
}