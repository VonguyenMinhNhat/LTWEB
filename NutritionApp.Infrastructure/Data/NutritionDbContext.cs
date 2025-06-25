using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NutritionApp.Core.Entities;

namespace NutritionApp.Infrastructure.Data;

public class NutritionDbContext : IdentityDbContext<User, Microsoft.AspNetCore.Identity.IdentityRole<int>, int>
{
    public NutritionDbContext(DbContextOptions<NutritionDbContext> options) : base(options)
    {
    }

    public DbSet<PhysicalInfo> PhysicalInfos { get; set; }
    public DbSet<Food> Foods { get; set; }
    public DbSet<Meal> Meals { get; set; }
    public DbSet<MealFood> MealFoods { get; set; }
    public DbSet<SearchHistory> SearchHistories { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<PhysicalInfoHistory> PhysicalInfoHistories { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure User entity
        builder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.FirstName).HasColumnName("first_name");
            entity.Property(e => e.LastName).HasColumnName("last_name");
            entity.Property(e => e.Avatar).HasColumnName("avatar");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        // Configure PhysicalInfo entity
        builder.Entity<PhysicalInfo>(entity =>
        {
            entity.ToTable("physical_info");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Weight).HasColumnName("weight").HasPrecision(10, 2);
            entity.Property(e => e.Height).HasColumnName("height").HasPrecision(10, 2);
            entity.Property(e => e.Age).HasColumnName("age");
            entity.Property(e => e.Gender).HasColumnName("gender");
            entity.Property(e => e.ActivityLevel).HasColumnName("activity_level");
            entity.Property(e => e.Bmi).HasColumnName("bmi").HasPrecision(10, 2);
            entity.Property(e => e.Bmr).HasColumnName("bmr").HasPrecision(10, 2);
            entity.Property(e => e.DailyCalorieNeed).HasColumnName("daily_calorie_need").HasPrecision(10, 2);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasOne(e => e.User)
                .WithMany(u => u.PhysicalInfos)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Food entity
        builder.Entity<Food>(entity =>
        {
            entity.ToTable("foods");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Calories).HasColumnName("calories").HasPrecision(10, 2);
            entity.Property(e => e.Protein).HasColumnName("protein").HasPrecision(10, 2);
            entity.Property(e => e.Carbohydrates).HasColumnName("carbohydrates").HasPrecision(10, 2);
            entity.Property(e => e.Fat).HasColumnName("fat").HasPrecision(10, 2);
            entity.Property(e => e.Fiber).HasColumnName("fiber").HasPrecision(10, 2);
            entity.Property(e => e.Sugar).HasColumnName("sugar").HasPrecision(10, 2);
            entity.Property(e => e.Sodium).HasColumnName("sodium").HasPrecision(10, 2);
            entity.Property(e => e.Category).HasColumnName("category");
            entity.Property(e => e.Image).HasColumnName("image");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        });

        // Configure Meal entity
        builder.Entity<Meal>(entity =>
        {
            entity.ToTable("meals");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.MealType).HasColumnName("meal_type");
            entity.Property(e => e.MealDate).HasColumnName("meal_date");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasOne(e => e.User)
                .WithMany(u => u.Meals)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure MealFood entity
        builder.Entity<MealFood>(entity =>
        {
            entity.ToTable("meal_foods");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.MealId).HasColumnName("meal_id");
            entity.Property(e => e.FoodId).HasColumnName("food_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity").HasPrecision(10, 2);
            entity.Property(e => e.Unit).HasColumnName("unit");

            entity.HasOne(e => e.Meal)
                .WithMany(m => m.MealFoods)
                .HasForeignKey(e => e.MealId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Food)
                .WithMany(f => f.MealFoods)
                .HasForeignKey(e => e.FoodId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure SearchHistory entity
        builder.Entity<SearchHistory>(entity =>
        {
            entity.ToTable("search_history");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.FoodId).HasColumnName("food_id");
            entity.Property(e => e.SearchedAt).HasColumnName("searched_at");

            entity.HasOne(e => e.User)
                .WithMany(u => u.SearchHistories)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Food)
                .WithMany(f => f.SearchHistories)
                .HasForeignKey(e => e.FoodId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Notification entity
        builder.Entity<Notification>(entity =>
        {
            entity.ToTable("notifications");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.Message).HasColumnName("message");
            entity.Property(e => e.Type).HasColumnName("type");
            entity.Property(e => e.IsRead).HasColumnName("is_read");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.ReadAt).HasColumnName("read_at");

            entity.HasOne(e => e.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
} 