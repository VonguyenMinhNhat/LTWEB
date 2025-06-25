namespace NutritionApp.Core.Entities;

public class PhysicalInfoHistory
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal Height { get; set; }
    public decimal Weight { get; set; }
    public int Age { get; set; }
    public string Gender { get; set; } = "";
    public string ActivityLevel { get; set; } = "";
    public decimal? Bmi { get; set; }
    public decimal? Bmr { get; set; }
    public int? DailyCalorieNeed { get; set; }
    public DateTime RecordedAt { get; set; }
    // Navigation property (optional)
    public virtual User? User { get; set; }
} 