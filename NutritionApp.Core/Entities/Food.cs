namespace NutritionApp.Core.Entities;

public class Food
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Calories { get; set; }
    public decimal Protein { get; set; }
    public decimal Carbohydrates { get; set; }
    public decimal Fat { get; set; }
    public decimal Fiber { get; set; }
    public decimal Sugar { get; set; }
    public decimal Sodium { get; set; }
    public string? Category { get; set; }
    public string? Image { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ICollection<MealFood> MealFoods { get; set; } = new List<MealFood>();
    public virtual ICollection<SearchHistory> SearchHistories { get; set; } = new List<SearchHistory>();
} 