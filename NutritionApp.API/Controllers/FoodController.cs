using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutritionApp.Core.DTOs;
using NutritionApp.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace NutritionApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FoodController : ControllerBase
{
    private readonly IFoodService _foodService;

    public FoodController(IFoodService foodService)
    {
        _foodService = foodService;
    }

    [HttpGet("search")]
    public async Task<ActionResult<FoodSearchResponse>> SearchFoods([FromQuery] FoodSearchRequest request)
    {
        try
        {
            var response = await _foodService.SearchFoodsAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FoodDto>> GetFoodById(int id)
    {
        try
        {
            var food = await _foodService.GetFoodByIdAsync(id);
            if (food == null)
                return NotFound(new { message = "Food not found" });

            return Ok(food);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("history")]
    public async Task<ActionResult<List<FoodDto>>> GetFoodHistory()
    {
        try
        {
            var userId = int.Parse(User.FindFirst("sub")?.Value ?? "0");
            var history = await _foodService.GetFoodHistoryAsync(userId);
            return Ok(history);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("popular")]
    public async Task<ActionResult<List<FoodDto>>> GetPopularFoods()
    {
        try
        {
            var foods = await _foodService.GetPopularFoodsAsync();
            return Ok(foods);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("categories")]
    public async Task<ActionResult<List<string>>> GetFoodCategories()
    {
        try
        {
            var categories = await _foodService.GetFoodCategoriesAsync();
            return Ok(categories);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("nutritionix")]
    [AllowAnonymous]
    public async Task<IActionResult> SearchNutritionix([FromBody] NutritionixRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Query))
            return BadRequest(new { message = "Query is required" });

        var appId = Environment.GetEnvironmentVariable("NUTRITIONIX_APP_ID") ?? "";
        var apiKey = Environment.GetEnvironmentVariable("NUTRITIONIX_API_KEY") ?? "";
        if (string.IsNullOrEmpty(appId) || string.IsNullOrEmpty(apiKey))
            return StatusCode(500, new { message = "Nutritionix API credentials not configured" });

        using var http = new HttpClient();
        // 1) Lấy dữ liệu dinh dưỡng chính
        var nutrientReq = new HttpRequestMessage(HttpMethod.Post, "https://trackapi.nutritionix.com/v2/natural/nutrients");
        nutrientReq.Headers.Add("x-app-id", appId);
        nutrientReq.Headers.Add("x-app-key", apiKey);
        nutrientReq.Content = new StringContent($"{{\"query\":\"{req.Query}\"}}", System.Text.Encoding.UTF8, "application/json");
        var nutrientRes = await http.SendAsync(nutrientReq);
        if (!nutrientRes.IsSuccessStatusCode)
        {
            var text = await nutrientRes.Content.ReadAsStringAsync();
            return StatusCode((int)nutrientRes.StatusCode, new { message = $"Nutritionix API error: {text}" });
        }
        var nutrientJson = await nutrientRes.Content.ReadAsStringAsync();
        var foods = System.Text.Json.JsonDocument.Parse(nutrientJson).RootElement.GetProperty("foods");

        // 2) Gọi instant API để map nhóm thức ăn
        var instantReq = new HttpRequestMessage(HttpMethod.Get, $"https://trackapi.nutritionix.com/v2/search/instant?query={Uri.EscapeDataString(req.Query)}");
        instantReq.Headers.Add("x-app-id", appId);
        instantReq.Headers.Add("x-app-key", apiKey);
        var instantRes = await http.SendAsync(instantReq);
        var instantJson = await instantRes.Content.ReadAsStringAsync();
        var instantDoc = System.Text.Json.JsonDocument.Parse(instantJson);
        var instantGroupMap = new Dictionary<string, string>();
        if (instantDoc.RootElement.TryGetProperty("common", out var commonFoods))
        {
            foreach (var item in commonFoods.EnumerateArray())
            {
                if (item.TryGetProperty("food_name", out var foodName) &&
                    item.TryGetProperty("tags", out var tags) &&
                    tags.TryGetProperty("food_group", out var foodGroup))
                {
                    instantGroupMap[foodName.GetString().ToLower()] = foodGroup.GetString();
                }
            }
        }

        // 3) Enrich từng món với food_group
        var enrichedFoods = new List<Dictionary<string, object>>();
        foreach (var food in foods.EnumerateArray())
        {
            var dict = new Dictionary<string, object>();
            foreach (var prop in food.EnumerateObject())
                dict[prop.Name] = prop.Value.ToString();
            string foodGroup = "Unknown";
            if (dict.TryGetValue("nix_item_id", out var nixIdObj) && nixIdObj is string nixId && !string.IsNullOrEmpty(nixId))
            {
                var itemReq = new HttpRequestMessage(HttpMethod.Get, $"https://trackapi.nutritionix.com/v2/search/item?nix_item_id={nixId}");
                itemReq.Headers.Add("x-app-id", appId);
                itemReq.Headers.Add("x-app-key", apiKey);
                var itemRes = await http.SendAsync(itemReq);
                var itemJson = await itemRes.Content.ReadAsStringAsync();
                var itemDoc = System.Text.Json.JsonDocument.Parse(itemJson);
                if (itemDoc.RootElement.TryGetProperty("foods", out var foodsArr) && foodsArr.GetArrayLength() > 0)
                {
                    var tags = foodsArr[0].GetProperty("tags");
                    if (tags.TryGetProperty("food_group", out var groupProp))
                        foodGroup = groupProp.GetString();
                }
            }
            if (foodGroup == "Unknown" && dict.TryGetValue("food_name", out var foodNameObj) && foodNameObj is string foodNameStr)
            {
                instantGroupMap.TryGetValue(foodNameStr.ToLower(), out foodGroup);
                foodGroup ??= "Unknown";
            }
            dict["food_group"] = foodGroup;
            enrichedFoods.Add(dict);
        }
        return Ok(enrichedFoods);
    }

    public class NutritionixRequest
    {
        public string Query { get; set; }
    }
} 