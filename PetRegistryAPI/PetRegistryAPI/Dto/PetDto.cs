using System.ComponentModel.DataAnnotations;

using PetRegistryAPI.Models;

namespace PetRegistryAPI.Dto
{
    public class PetDto
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Gender { get; set; }

        [Required]
        public string Species { get; set; }

        public string? Breed { get; set; }
        public string? DateOfBirth { get; set; }
        public string? Color { get; set; }
        public bool? IsMicrochip { get; set; }
        public bool? IsNeutered { get; set; }

        [Required]
        public DateOnly RegistrationDate { get; set; }

        [Required]
        public int PersonId { get; set; }
    }
}
