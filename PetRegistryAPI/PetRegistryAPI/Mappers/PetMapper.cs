using Humanizer;
using PetRegistryAPI.Dto;
using PetRegistryAPI.Models;

namespace PetRegistryAPI.Mappers
{
    public class PetMapper
    {
        public static PetDto ToDto(Pet pet) => new PetDto
        {
            Id = pet.Id,
            Name = pet.Name,
            Gender = pet.Gender,
            Species = pet.Species,
            Breed = pet.Breed,
            DateOfBirth = pet.DateOfBirth,
            Color = pet.Color,
            IsMicrochip = pet.IsMicrochip,
            IsNeutered = pet.IsNeutered,
            RegistrationDate = pet.RegistrationDate,
            PersonId = pet.PersonId
        };

        public static Pet ToEntity(PetDto dto) => new Pet
        {
            Id = dto.Id,
            Name = dto.Name,
            Gender = dto.Gender,
            Species = dto.Species,
            Breed = dto.Breed,
            DateOfBirth = dto.DateOfBirth,
            Color = dto.Color,
            IsMicrochip = dto.IsMicrochip,
            IsNeutered = dto.IsNeutered,
            RegistrationDate = dto.RegistrationDate,
            PersonId = dto.PersonId
        };
    }
}
