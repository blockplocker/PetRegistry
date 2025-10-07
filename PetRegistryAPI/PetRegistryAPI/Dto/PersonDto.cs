using System.ComponentModel.DataAnnotations;

namespace PetRegistryAPI.Dto
{
    public class PersonDto
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(15, ErrorMessage = "Firstname has a max lenght of 15")] 
        public string FirstName { get; set; }

        [Required]
        [MaxLength(20, ErrorMessage = "LastName has a max lenght of 20")] 
        public string LastName { get; set; }

        [Required]
        [MaxLength(25, ErrorMessage = "Address has a max lenght of 25")] 
        public string Address { get; set; }

        [Required]
        [MaxLength(25, ErrorMessage = "City has a max lenght of 25")] 
        public string City { get; set; }

        [Required]
        [RegularExpression(@"^[0-9]{10,15}$", ErrorMessage = "Invalid phone number format")]
        public string PhoneNumber { get; set; }

        [Required]
        [MaxLength(50)]
        [EmailAddress]
        public string Email { get; set; }
    }
}
