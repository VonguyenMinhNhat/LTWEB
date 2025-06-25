using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutritionApp.Core.Interfaces;

namespace NutritionApp.API.Controllers;

[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _service;
    public NotificationsController(INotificationService service) => _service = service;

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> Get()
    {
        var userId = int.Parse(User.FindFirst("sub")?.Value ?? "0");
        var notifs = await _service.GetNotificationsAsync(userId);
        return Ok(notifs);
    }

    [HttpPut("read-all")]
    [Authorize]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = int.Parse(User.FindFirst("sub")?.Value ?? "0");
        await _service.MarkAllAsReadAsync(userId);
        return Ok(new { message = "All notifications marked as read" });
    }

    [HttpPut("{id}/read")]
    [Authorize]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = int.Parse(User.FindFirst("sub")?.Value ?? "0");
        var detail = await _service.MarkAsReadAsync(userId, id);
        if (detail == null) return NotFound(new { message = "Notification not found" });
        return Ok(new { detail });
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = int.Parse(User.FindFirst("sub")?.Value ?? "0");
        var ok = await _service.DeleteNotificationAsync(userId, id);
        if (!ok) return NotFound(new { message = "Notification not found" });
        return Ok(new { message = "Notification deleted" });
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] NotificationCreateDto dto)
    {
        var userId = int.Parse(User.FindFirst("sub")?.Value ?? "0");
        if (string.IsNullOrEmpty(dto.Message))
            return BadRequest(new { message = "Missing notification message" });
        await _service.CreateNotificationAsync(userId, dto.Message, dto.Detail);
        return Ok(new { message = "Notification sent successfully" });
    }
}

public class NotificationCreateDto
{
    public string Message { get; set; } = "";
    public string? Detail { get; set; }
} 