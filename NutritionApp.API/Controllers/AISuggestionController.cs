using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutritionApp.Core.DTOs;
using NutritionApp.Core.Interfaces;

namespace NutritionApp.API.Controllers;

[ApiController]
[Route("api/foods/ai-suggestions")]
public class AISuggestionController : ControllerBase
{
    private readonly IAISuggestionService _service;
    public AISuggestionController(IAISuggestionService service) => _service = service;

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Suggest([FromBody] AISuggestionCriteria criteria)
    {
        var userId = int.Parse(User.FindFirst("sub")?.Value ?? "0");
        var result = await _service.GetSuggestionAsync(userId, criteria);
        return Ok(result);
    }
} 