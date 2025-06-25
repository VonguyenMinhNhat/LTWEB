namespace NutritionApp.Core.Entities;

public class Meal
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string MealType { get; set; } = string.Empty; // breakfast, lunch, dinner, snack
    public DateTime MealDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<MealFood> MealFoods { get; set; } = new List<MealFood>();
} 