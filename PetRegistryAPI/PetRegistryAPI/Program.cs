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

            builder.Services.AddCors(options =>           // -------------- for local angular v
            {
                options.AddPolicy("AllowAngularDevClient",
                    policy =>
                    {
                        policy.WithOrigins("http://localhost:4200") // Angular dev server
                              .AllowAnyHeader()
                              .AllowAnyMethod();
                    });
            });                   // -------------- for local angular  /\

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors("AllowAngularDevClient");  // -------------- for local angular

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
