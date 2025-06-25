// src/api/food.jsx
export async function searchFood(query) {
    const appId = process.env.REACT_APP_NUTRITIONIX_APP_ID;
    const apiKey = process.env.REACT_APP_NUTRITIONIX_API_KEY;

    // 1) Lấy dữ liệu dinh dưỡng chính
    const nutrientRes = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-app-id': appId,
            'x-app-key': apiKey,
        },
        body: JSON.stringify({ query }),
    });
    if (!nutrientRes.ok) {
        const text = await nutrientRes.text();
        throw new Error(`Nutrition API lỗi ${nutrientRes.status}: ${text}`);
    }
    const { foods } = await nutrientRes.json();

    // 2) Gọi instant API để map nhóm thức ăn
    const instantRes = await fetch(
        `https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(query)}`,
        { headers: { 'x-app-id': appId, 'x-app-key': apiKey } }
    );
    const instantData = await instantRes.json();
    const instantGroupMap = {};
    instantData.common.forEach(item => {
        if (item.food_name && item.tags?.food_group) {
            instantGroupMap[item.food_name.toLowerCase()] = item.tags.food_group;
        }
    });

    // 3) Enrich từng món với food_group
    const enrichedFoods = await Promise.all(
        foods.map(async food => {
            try {
                if (food.nix_item_id) {
                    const res = await fetch(
                        `https://trackapi.nutritionix.com/v2/search/item?nix_item_id=${food.nix_item_id}`,
                        { headers: { 'x-app-id': appId, 'x-app-key': apiKey } }
                    );
                    const data = await res.json();
                    const group = data.foods?.[0]?.tags?.food_group;
                    if (group) return { ...food, food_group: group };
                }
                // Fallback
                const fallback = instantGroupMap[food.food_name.toLowerCase()] || 'Unknown';
                return { ...food, food_group: fallback };
            } catch {
                return { ...food, food_group: 'Unknown' };
            }
        })
    );

    // 4) Trả về danh sách đã enrich
    return enrichedFoods;
}
