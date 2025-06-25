using Microsoft.EntityFrameworkCore;
using NutritionApp.Core.DTOs;
using NutritionApp.Core.Entities;
using NutritionApp.Core.Interfaces;
using NutritionApp.Infrastructure.Data;

namespace NutritionApp.Infrastructure.Services;

public class PhysicalInfoService : IPhysicalInfoService
{
    private readonly NutritionDbContext _db;
    public PhysicalInfoService(NutritionDbContext db) => _db = db;

    public async Task<PhysicalInfo?> GetCurrentAsync(int userId)
    {
        return await _db.PhysicalInfos.FirstOrDefaultAsync(p => p.UserId == userId);
    }

    public async Task<List<PhysicalInfoHistory>> GetHistoryAsync(int userId)
    {
        return await _db.Set<PhysicalInfoHistory>()
            .Where(h => h.UserId == userId)
            .OrderByDescending(h => h.RecordedAt)
            .Take(10)
            .ToListAsync();
    }

    public async Task<PhysicalInfo?> SaveAsync(int userId, PhysicalInfoInputDto input)
    {
        try
        {
            Console.WriteLine($"[PhysicalInfo] userId={userId}, input={{height={input.Height}, weight={input.Weight}, age={input.Age}, gender={input.Gender}, activityLevel={input.ActivityLevel}}}");
            if (input.Height < 100 || input.Height > 250 || input.Weight < 30 || input.Weight > 200 || input.Age < 10 || input.Age > 120)
            {
                Console.WriteLine($"[PhysicalInfo] Dữ liệu không hợp lệ: height={input.Height}, weight={input.Weight}, age={input.Age}");
                return null;
            }

            var heightInM = input.Height / 100.0;
            var bmi = Math.Round((double)input.Weight / (heightInM * heightInM), 1);
            double bmr = input.Gender == "Male"
                ? 88.362 + (13.397 * (double)input.Weight) + (4.799 * (double)input.Height) - (5.677 * input.Age)
                : 447.593 + (9.247 * (double)input.Weight) + (3.098 * (double)input.Height) - (4.330 * input.Age);
            var activityMap = new Dictionary<string, double> { { "Low", 1.2 }, { "Moderate", 1.55 }, { "High", 1.725 } };
            var calorieNeed = (int)Math.Round(bmr * (activityMap.ContainsKey(input.ActivityLevel) ? activityMap[input.ActivityLevel] : 1.2));

            var info = await _db.PhysicalInfos.FirstOrDefaultAsync(p => p.UserId == userId);
            if (info == null)
            {
                info = new PhysicalInfo
                {
                    UserId = userId,
                    Height = input.Height,
                    Weight = input.Weight,
                    Age = input.Age,
                    Gender = input.Gender,
                    ActivityLevel = input.ActivityLevel,
                    Bmi = (decimal)bmi,
                    Bmr = (decimal)bmr,
                    DailyCalorieNeed = calorieNeed,
                    CreatedAt = DateTime.UtcNow
                };
                _db.PhysicalInfos.Add(info);
                Console.WriteLine($"[PhysicalInfo] Thêm mới cho userId={userId}");
            }
            else
            {
                info.Height = input.Height;
                info.Weight = input.Weight;
                info.Age = input.Age;
                info.Gender = input.Gender;
                info.ActivityLevel = input.ActivityLevel;
                info.Bmi = (decimal)bmi;
                info.Bmr = (decimal)bmr;
                info.DailyCalorieNeed = calorieNeed;
                info.UpdatedAt = DateTime.UtcNow;
                Console.WriteLine($"[PhysicalInfo] Cập nhật cho userId={userId}");
            }

            // Lưu lịch sử
            var history = new PhysicalInfoHistory
            {
                UserId = userId,
                Height = input.Height,
                Weight = input.Weight,
                Age = input.Age,
                Gender = input.Gender,
                ActivityLevel = input.ActivityLevel,
                Bmi = (decimal)bmi,
                Bmr = (decimal)bmr,
                DailyCalorieNeed = calorieNeed,
                RecordedAt = DateTime.UtcNow
            };
            _db.Set<PhysicalInfoHistory>().Add(history);

            await _db.SaveChangesAsync();
            Console.WriteLine($"[PhysicalInfo] Đã lưu thành công cho userId={userId}");
            return info;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PhysicalInfo] Lỗi khi lưu: {ex.Message} {(ex.InnerException != null ? ex.InnerException.Message : "")}");
            return null;
        }
    }
} 