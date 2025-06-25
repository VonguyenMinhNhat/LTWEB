using Microsoft.EntityFrameworkCore;
using NutritionApp.Core.Entities;
using NutritionApp.Core.Interfaces;
using NutritionApp.Infrastructure.Data;

namespace NutritionApp.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly NutritionDbContext _db;
    public NotificationService(NutritionDbContext db) => _db = db;

    public async Task<List<Notification>> GetNotificationsAsync(int userId)
    {
        return await _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        var notifs = await _db.Notifications.Where(n => n.UserId == userId && !n.IsRead).ToListAsync();
        foreach (var n in notifs) n.IsRead = true;
        await _db.SaveChangesAsync();
    }

    public async Task<string?> MarkAsReadAsync(int userId, int notifId)
    {
        var notif = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == notifId && n.UserId == userId);
        if (notif == null) return null;
        notif.IsRead = true;
        await _db.SaveChangesAsync();
        return notif.Message; // hoặc notif.Detail nếu muốn
    }

    public async Task<bool> DeleteNotificationAsync(int userId, int notifId)
    {
        var notif = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == notifId && n.UserId == userId);
        if (notif == null) return false;
        _db.Notifications.Remove(notif);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task CreateNotificationAsync(int userId, string message, string? detail)
    {
        var notif = new Notification
        {
            UserId = userId,
            Title = "Notification",
            Message = message,
            Type = "info",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        await _db.Notifications.AddAsync(notif);
        await _db.SaveChangesAsync();
    }
} 