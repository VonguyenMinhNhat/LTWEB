namespace NutritionApp.Core.Entities;

public class MealFood
{
    public int Id { get; set; }
    public int MealId { get; set; }
    public int FoodId { get; set; }
    public decimal Quantity { get; set; } = 1.0m;
    public string? Unit { get; set; } = "serving";
    
    // Navigation properties
    public virtual Meal Meal { get; set; } = null!;
    public virtual Food Food { get; set; } = null!;
} 