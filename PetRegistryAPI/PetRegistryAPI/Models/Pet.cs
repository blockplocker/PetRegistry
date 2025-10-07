using System.ComponentModel.DataAnnotations;

namespace PetRegistryAPI.Models
{
    public class Pet
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(15)]
        public string Name { get; set; }
        
        [Required]
        public string Gender { get; set; }
        
        [Required]
        [MaxLength(15)]
        public string Species { get; set; }
        
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

        public virtual Person Person { get; set; }
    }
}
