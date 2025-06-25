namespace NutritionApp.Core.DTOs;
using System.Text.Json.Serialization;

public class PhysicalInfoInputDto
{
    [JsonPropertyName("height")]
    public int Height { get; set; }
    [JsonPropertyName("weight")]
    public int Weight { get; set; }
    [JsonPropertyName("age")]
    public int Age { get; set; }
    [JsonPropertyName("gender")]
    public string Gender { get; set; } = "";
    [JsonPropertyName("activityLevel")]
    public string ActivityLevel { get; set; } = "";
} 