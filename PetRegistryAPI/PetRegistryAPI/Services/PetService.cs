using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PetRegistryAPI.Data;
using PetRegistryAPI.Dto;
using PetRegistryAPI.Mappers;
using PetRegistryAPI.Models;

namespace PetRegistryAPI.Services
{
    public class PetService
    {
        private readonly PetRegistryAPIContext _context;

        public PetService(PetRegistryAPIContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PetDto>> GetAllPetsAsync()
        {
            var pets = await _context.Pet.ToListAsync();
            return pets.Select(PetMapper.ToDto);
        }

        public async Task<PetDto?> GetPetAsync(int id)
        {
            var pet = await _context.Pet.FindAsync(id);
            return pet == null ? null : PetMapper.ToDto(pet);
        }

        public async Task<PetDto> CreatePetAsync(PetDto dto)
        {
            var pet = PetMapper.ToEntity(dto);
            _context.Pet.Add(pet);
            await _context.SaveChangesAsync();
            return PetMapper.ToDto(pet);
        }

        public async Task<bool> UpdatePetAsync(int id, PetDto dto)
        {
            if (id != dto.Id) return false;
            var pet = await _context.Pet.FindAsync(id);
            if (pet == null) return false;

            pet.Name = dto.Name;
            pet.Gender = dto.Gender;
            pet.Species = dto.Species;
            pet.Breed = dto.Breed;
            pet.DateOfBirth = dto.DateOfBirth;
            pet.Color = dto.Color;
            pet.IsMicrochip = dto.IsMicrochip;
            pet.IsNeutered = dto.IsNeutered;
            pet.RegistrationDate = dto.RegistrationDate;
            pet.PersonId = dto.PersonId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePetAsync(int id)
        {
            var pet = await _context.Pet.FindAsync(id);
            if (pet == null) return false;
            _context.Pet.Remove(pet);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
