using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutritionApp.Core.DTOs;
using NutritionApp.Core.Interfaces;

namespace NutritionApp.API.Controllers;

[ApiController]
[Route("api/physicalInfo")]
public class PhysicalInfoController : ControllerBase
{
    private readonly IPhysicalInfoService _service;
    public PhysicalInfoController(IPhysicalInfoService service) => _service = service;

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> Get()
    {
        var userId = int.Parse(User.FindFirst("sub")?.Value ?? "0");
        var info = await _service.GetCurrentAsync(userId);
        return Ok(info);
    }
    [HttpGet("history")]
    [Authorize]
    public async Task<IActionResult> GetHistory()
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier || c.Type == "sub" || c.Type == "userId");
        int userId = userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        Console.WriteLine($"[PhysicalInfoHistory] userId: {userId}");
        var history = await _service.GetHistoryAsync(userId);
        Console.WriteLine($"[PhysicalInfoHistory] count: {history.Count}");
        return Ok(history);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Save([FromBody] PhysicalInfoInputDto input)
    {
        Console.WriteLine("[PhysicalInfoController] Đã nhận request lưu physical info");
        if (!ModelState.IsValid)
        {
            Console.WriteLine("[PhysicalInfoController] ModelState không hợp lệ");
            return BadRequest(ModelState);
        }
        try
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("nameid")?.Value
                ?? User.FindFirst("sub")?.Value;
            var userId = int.TryParse(userIdStr, out var id) ? id : 0;
            Console.WriteLine($"[PhysicalInfoController] userId={userId} (from claim value: {userIdStr})");
            var result = await _service.SaveAsync(userId, input);
            if (result == null)
                return BadRequest(new { message = "Dữ liệu không hợp lệ hoặc lưu thất bại" });
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
} 