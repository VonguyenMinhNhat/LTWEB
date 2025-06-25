using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using NutritionApp.Core.DTOs;
using NutritionApp.Core.Interfaces;
using NutritionApp.Infrastructure.Data;

namespace NutritionApp.Infrastructure.Services;

public class AISuggestionService : IAISuggestionService
{
    private readonly NutritionDbContext _db;
    private readonly HttpClient _http;
    private readonly string _apiKey;

    public AISuggestionService(NutritionDbContext db, IConfiguration config)
    {
        _db = db;
        _http = new HttpClient();
        _apiKey = config["OpenAI:ApiKey"];
    }

    public async Task<string> GetSuggestionAsync(int userId, AISuggestionCriteria criteria)
    {
        var meals = await _db.Meals
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.MealDate)
            .Take(5)
            .Include(m => m.MealFoods)
                .ThenInclude(mf => mf.Food)
            .ToListAsync();

        if (!meals.Any())
            return "No recent meal data.";

        var foodsWithNutrition = meals.SelectMany(m => m.MealFoods.Select(mf => new {
            food_name = mf.Food.Name,
            calo = mf.Food.Calories,
            protein = mf.Food.Protein,
            carb = mf.Food.Carbohydrates,
            fat = mf.Food.Fat
        })).ToList();

        var goals = new List<string>();
        if (criteria.ReduceCalories) goals.Add("giảm calo");
        if (criteria.ReduceFat) goals.Add("giảm chất béo");
        if (criteria.ReduceCarbs) goals.Add("giảm tinh bột");
        if (criteria.IncreaseProtein) goals.Add("tăng protein");
        if (!goals.Any()) goals.Add("tìm món ăn lành mạnh");

        var foodsText = JsonSerializer.Serialize(foodsWithNutrition, new JsonSerializerOptions { WriteIndented = true });
        var prompt = $@"Bạn là chuyên gia dinh dưỡng. Dưới đây là các món ăn gần đây của người dùng (bao gồm thông tin dinh dưỡng):
{foodsText}

Tiêu chí chế độ ăn: {string.Join(", ", goals)}

1. Phân tích món ăn đã được lấy từ cơ sở dữ liệu, nhắc nhở nếu có món chưa lành mạnh.
2. Giải thích lợi ích sức khỏe hoặc dinh dưỡng của những món ăn đã được gửi lên từ cơ sở dữ liệu
3. Đề xuất 3 món ăn lành mạnh hơn, không trùng với các món đã nhập.
   Với mỗi món đề xuất, hãy ghi rõ tên món, thông tin dinh dưỡng cũng như lợi ích khi dùng món đó.
   Gợi ý thực đơn cho người dùng.   
   Trả về kết quả dạng văn bản dễ đọc cho người dùng.";

        prompt = TranslatePromptToEnglish(prompt);

        var requestBody = new
        {
            model = "openai/gpt-3.5-turbo",
            messages = new[]
            {
                new { role = "system", content = "You are a nutrition expert." },
                new { role = "user", content = prompt }
            }
        };

        var req = new HttpRequestMessage(HttpMethod.Post, "https://openrouter.ai/api/v1/chat/completions");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        req.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        var response = await _http.SendAsync(req);
        var json = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(json);
        var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
        return content ?? "No suggestion generated.";
    }

    private string TranslatePromptToEnglish(string prompt)
    {
        return prompt
            .Replace("Bạn là chuyên gia dinh dưỡng.", "You are a nutrition expert.")
            .Replace("Dưới đây là các món ăn gần đây của người dùng (bao gồm thông tin dinh dưỡng):", "Here are the user's recent meals (including nutrition information):")
            .Replace("Tiêu chí chế độ ăn:", "Diet criteria:")
            .Replace("giảm calo", "reduce calories")
            .Replace("giảm chất béo", "reduce fat")
            .Replace("giảm tinh bột", "reduce carbs")
            .Replace("tăng protein", "increase protein")
            .Replace("tìm món ăn lành mạnh", "find healthy meals")
            .Replace("Phân tích các món trên, nhắc nhở nếu có món chưa lành mạnh.", "1. Analyze the above meals and remind if there are any unhealthy dishes.")
            .Replace("Giải thích lợi ích sức khỏe hoặc dinh dưỡng khi sử dụng món đó.", "2. Explain the health or nutritional benefits of those dishes.")
            .Replace("Đề xuất 3 món ăn lành mạnh hơn, không trùng với các món đã nhập.", "3. Suggest 3 healthier dishes, not repeating the above.")
            .Replace("Với mỗi món đề xuất, hãy ghi rõ tên món, thông tin dinh dưỡng cũng như lợi ích khi dùng món đó.", "For each suggestion, provide the dish name, nutrition info, and its benefits.")
            .Replace("Gợi ý thực đơn cho người dùng.", "Suggest a menu for the user.")
            .Replace("Trả về kết quả dạng văn bản dễ đọc cho người dùng.", "Return the result in a user-friendly English text.");
    }
} 