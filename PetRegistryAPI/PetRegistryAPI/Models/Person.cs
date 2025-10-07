using System.ComponentModel.DataAnnotations;

namespace PetRegistryAPI.Models
{
    public class Person
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(15)]
        public string FirstName { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string LastName { get; set; }
        
        [Required]
        [MaxLength(25)]
        public string Address { get; set; }
        
        [Required]
        [MaxLength(25)]
        public string City { get; set; }
        
        [Required]
        [RegularExpression(@"^[0-9]{10,15}$")]
        public string PhoneNumber { get; set; }
        
        [Required]
        [MaxLength(50)]
        [EmailAddress]
        public string Email { get; set; }

        public virtual ICollection<Pet> Pets { get; set; }
    }

}