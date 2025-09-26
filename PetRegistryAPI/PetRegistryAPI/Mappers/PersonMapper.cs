using PetRegistryAPI.Dto;
using PetRegistryAPI.Models;

namespace PetRegistryAPI.Mappers
{
    public class PersonMapper
    {
        public static PersonDto ToDto(Person person) => new PersonDto
        {
            Id = person.Id,
            FirstName = person.FirstName,
            LastName = person.LastName,
            Address = person.Address,
            City = person.City,
            PhoneNumber = person.PhoneNumber,
            Email = person.Email
        };

        public static Person ToEntity(PersonDto dto) => new Person
        {
            Id = dto.Id,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Address = dto.Address,
            City = dto.City,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email
        };
    }
}
