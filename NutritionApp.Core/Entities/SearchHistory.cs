namespace NutritionApp.Core.Entities;

public class SearchHistory
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int FoodId { get; set; }
    public DateTime SearchedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Food Food { get; set; } = null!;
} 