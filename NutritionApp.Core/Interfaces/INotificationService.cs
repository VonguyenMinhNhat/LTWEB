using NutritionApp.Core.Entities;

public interface INotificationService
{
    Task<List<Notification>> GetNotificationsAsync(int userId);
    Task MarkAllAsReadAsync(int userId);
    Task<string?> MarkAsReadAsync(int userId, int notifId);
    Task<bool> DeleteNotificationAsync(int userId, int notifId);
    Task CreateNotificationAsync(int userId, string message, string? detail);
} 