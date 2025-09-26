namespace PetRegistryAPI.Models
{
    public class Pet
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Gender { get; set; }
        public string Species { get; set; }
        public string? Breed { get; set; }
        public string? DateOfBirth { get; set; }
        public string? Color { get; set; }
        public bool? IsMicrochip { get; set; }
        public bool? IsNeutered { get; set; }
        public DateOnly RegistrationDate { get; set; }
        public int PersonId { get; set; }

        public virtual Person Person { get; set; }
    }
}
