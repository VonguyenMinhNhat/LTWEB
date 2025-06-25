using NutritionApp.Core.DTOs;

namespace NutritionApp.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<bool> ValidateTokenAsync(string token);
    Task<string> GenerateTokenAsync(int userId);
    Task<string> GenerateRefreshTokenAsync();
} 