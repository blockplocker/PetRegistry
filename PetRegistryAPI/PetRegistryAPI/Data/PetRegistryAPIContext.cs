using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PetRegistryAPI.Models;
using PetRegistryAPI.Dto;

namespace PetRegistryAPI.Data
{
    public class PetRegistryAPIContext : DbContext
    {
        public PetRegistryAPIContext (DbContextOptions<PetRegistryAPIContext> options)
            : base(options)
        {
        }

        public DbSet<PetRegistryAPI.Models.Person> Person { get; set; } = default!;
        public DbSet<PetRegistryAPI.Models.Pet> Pet { get; set; } = default!;
    }
}
