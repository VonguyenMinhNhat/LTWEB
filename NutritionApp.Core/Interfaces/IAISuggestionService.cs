namespace NutritionApp.Core.Interfaces;
using NutritionApp.Core.DTOs;

public interface IAISuggestionService
{
    Task<string> GetSuggestionAsync(int userId, AISuggestionCriteria criteria);
} 