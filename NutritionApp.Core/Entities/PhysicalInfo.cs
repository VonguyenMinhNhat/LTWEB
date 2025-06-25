namespace NutritionApp.Core.Entities;

public class PhysicalInfo
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal Weight { get; set; }
    public decimal Height { get; set; }
    public int Age { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string ActivityLevel { get; set; } = string.Empty;
    public decimal? Bmi { get; set; }
    public decimal? Bmr { get; set; }
    public decimal? DailyCalorieNeed { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation property
    public virtual User User { get; set; } = null!;
} 