using Microsoft.AspNetCore.Identity;

namespace NutritionApp.Core.Entities;

public class User : IdentityUser<int>
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Avatar { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public virtual ICollection<PhysicalInfo> PhysicalInfos { get; set; } = new List<PhysicalInfo>();
    public virtual ICollection<Meal> Meals { get; set; } = new List<Meal>();
    public virtual ICollection<SearchHistory> SearchHistories { get; set; } = new List<SearchHistory>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
} 