using NutritionApp.Core.Entities;
using NutritionApp.Core.DTOs;

public interface IPhysicalInfoService
{
    Task<PhysicalInfo?> GetCurrentAsync(int userId);
    Task<List<PhysicalInfoHistory>> GetHistoryAsync(int userId);
    Task<PhysicalInfo?> SaveAsync(int userId, PhysicalInfoInputDto input);
} 