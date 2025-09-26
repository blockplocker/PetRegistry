using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PetRegistryAPI.Data;
using PetRegistryAPI.Controllers;
using PetRegistryAPI.Services;

namespace PetRegistryAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddDbContext<PetRegistryAPIContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("PetRegistryAPIContext") ?? throw new InvalidOperationException("Connection string 'PetRegistryAPIContext' not found.")));

            // Add services to the container.
            builder.Services.AddScoped<PersonService>();
            builder.Services.AddScoped<PetService>();

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();


            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.UseCors(builder =>
            {
                builder
                    .WithOrigins(app.Configuration["AllowedOrigins"]!)
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });

            app.MapControllers();

            app.Run();
        }
    }
}
