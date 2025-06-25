using NutritionApp.Core.DTOs;

namespace NutritionApp.Core.Interfaces;

public interface IFoodService
{
    Task<FoodSearchResponse> SearchFoodsAsync(FoodSearchRequest request);
    Task<FoodDto?> GetFoodByIdAsync(int id);
    Task<List<FoodDto>> GetFoodHistoryAsync(int userId);
    Task<List<FoodDto>> GetPopularFoodsAsync();
    Task<List<string>> GetFoodCategoriesAsync();
} 