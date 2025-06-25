// Hàm kiểm tra chế độ ăn và cảnh báo nếu không cân đối
function checkDietBalance({ carbs, protein, fat }) {
    // Tỷ lệ khuyến nghị: Carb 50-60%, Protein 10-20%, Fat 20-30%
    const total = carbs + protein + fat;
    if (total === 0) return "Chưa nhập dữ liệu dinh dưỡng.";

    const carbPercent = (carbs / total) * 100;
    const proteinPercent = (protein / total) * 100;
    const fatPercent = (fat / total) * 100;

    let warnings = [];

    if (carbPercent < 50 || carbPercent > 60) {
        warnings.push("Tỷ lệ tinh bột (carb) không cân đối (khuyến nghị 50-60%).");
    }
    if (proteinPercent < 10 || proteinPercent > 20) {
        warnings.push("Tỷ lệ đạm (protein) không cân đối (khuyến nghị 10-20%).");
    }
    if (fatPercent < 20 || fatPercent > 30) {
        warnings.push("Tỷ lệ chất béo (fat) không cân đối (khuyến nghị 20-30%).");
    }

    if (warnings.length === 0) {
        return "Chế độ ăn cân đối.";
    }
    return warnings.join(" ");
}

module.exports = checkDietBalance;