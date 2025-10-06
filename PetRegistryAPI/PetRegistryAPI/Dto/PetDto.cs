using System.ComponentModel.DataAnnotations;

using PetRegistryAPI.Models;

namespace PetRegistryAPI.Dto
{
    public class PetDto
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(15)] 
        public string? Name { get; set; } 

        [Required]
        [MaxLength(10)]
        public string? Gender { get; set; }

        [Required]
        [MaxLength(15)] 
        public string? Species { get; set; }

        [MaxLength(15)] 
        public string? Breed { get; set; }
        public string? DateOfBirth { get; set; }
        [MaxLength(15)] 
        public string? Color { get; set; }
        public bool? IsMicrochip { get; set; }
        public bool? IsNeutered { get; set; }

        [Required]
        public DateTime RegistrationDate { get; set; }

        [Required]
        public int PersonId { get; set; }
    }
}
