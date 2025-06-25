using Microsoft.EntityFrameworkCore;
using NutritionApp.Core.DTOs;
using NutritionApp.Core.Entities;
using NutritionApp.Core.Interfaces;
using NutritionApp.Infrastructure.Data;

namespace NutritionApp.Infrastructure.Services;

public class FoodService : IFoodService
{
    private readonly NutritionDbContext _context;

    public FoodService(NutritionDbContext context)
    {
        _context = context;
    }

    public async Task<FoodSearchResponse> SearchFoodsAsync(FoodSearchRequest request)
    {
        var query = _context.Foods.AsQueryable();

        if (!string.IsNullOrEmpty(request.Query))
        {
            query = query.Where(f => f.Name.Contains(request.Query) || 
                                   (f.Description != null && f.Description.Contains(request.Query)));
        }

        if (!string.IsNullOrEmpty(request.Category))
        {
            query = query.Where(f => f.Category == request.Category);
        }

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var foods = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(f => new FoodDto
            {
                Id = f.Id,
                Name = f.Name,
                Description = f.Description,
                Calories = f.Calories,
                Protein = f.Protein,
                Carbohydrates = f.Carbohydrates,
                Fat = f.Fat,
                Fiber = f.Fiber,
                Sugar = f.Sugar,
                Sodium = f.Sodium,
                Category = f.Category,
                Image = f.Image
            })
            .ToListAsync();

        return new FoodSearchResponse
        {
            Foods = foods,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalPages = totalPages
        };
    }

    public async Task<FoodDto?> GetFoodByIdAsync(int id)
    {
        var food = await _context.Foods
            .Where(f => f.Id == id)
            .Select(f => new FoodDto
            {
                Id = f.Id,
                Name = f.Name,
                Description = f.Description,
                Calories = f.Calories,
                Protein = f.Protein,
                Carbohydrates = f.Carbohydrates,
                Fat = f.Fat,
                Fiber = f.Fiber,
                Sugar = f.Sugar,
                Sodium = f.Sodium,
                Category = f.Category,
                Image = f.Image
            })
            .FirstOrDefaultAsync();

        return food;
    }

    public async Task<List<FoodDto>> GetFoodHistoryAsync(int userId)
    {
        var history = await _context.SearchHistories
            .Where(sh => sh.UserId == userId)
            .OrderByDescending(sh => sh.SearchedAt)
            .Take(10)
            .Select(sh => new FoodDto
            {
                Id = sh.Food.Id,
                Name = sh.Food.Name,
                Description = sh.Food.Description,
                Calories = sh.Food.Calories,
                Protein = sh.Food.Protein,
                Carbohydrates = sh.Food.Carbohydrates,
                Fat = sh.Food.Fat,
                Fiber = sh.Food.Fiber,
                Sugar = sh.Food.Sugar,
                Sodium = sh.Food.Sodium,
                Category = sh.Food.Category,
                Image = sh.Food.Image
            })
            .Distinct()
            .ToListAsync();

        return history;
    }

    public async Task<List<FoodDto>> GetPopularFoodsAsync()
    {
        var popularFoods = await _context.SearchHistories
            .GroupBy(sh => sh.FoodId)
            .OrderByDescending(g => g.Count())
            .Take(10)
            .Select(g => new FoodDto
            {
                Id = g.First().Food.Id,
                Name = g.First().Food.Name,
                Description = g.First().Food.Description,
                Calories = g.First().Food.Calories,
                Protein = g.First().Food.Protein,
                Carbohydrates = g.First().Food.Carbohydrates,
                Fat = g.First().Food.Fat,
                Fiber = g.First().Food.Fiber,
                Sugar = g.First().Food.Sugar,
                Sodium = g.First().Food.Sodium,
                Category = g.First().Food.Category,
                Image = g.First().Food.Image
            })
            .ToListAsync();

        return popularFoods;
    }

    public async Task<List<string>> GetFoodCategoriesAsync()
    {
        var categories = await _context.Foods
            .Where(f => !string.IsNullOrEmpty(f.Category))
            .Select(f => f.Category!)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return categories;
    }
} 