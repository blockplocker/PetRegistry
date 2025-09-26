using PetRegistryAPI.Data;
using PetRegistryAPI.Dto;
using PetRegistryAPI.Mappers;
using PetRegistryAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace PetRegistryAPI.Services
{
    public class PersonService
    {
        private readonly PetRegistryAPIContext _context;

        public PersonService(PetRegistryAPIContext context)
        {
            _context = context;
        }

        public async Task<PersonDto> CreatePersonAsync(PersonDto dto)
        {
            var person = PersonMapper.ToEntity(dto);
            _context.Person.Add(person);
            await _context.SaveChangesAsync();
            return PersonMapper.ToDto(person);
        }

        public async Task<PersonDto?> GetPersonAsync(int id)
        {
            var person = await _context.Person.FindAsync(id);
            return person == null ? null : PersonMapper.ToDto(person);
        }

        public async Task<IEnumerable<PersonDto>> GetAllPeopleAsync()
        {
            var people = await _context.Person.ToListAsync();
            return people.Select(PersonMapper.ToDto);
        }

        public async Task<bool> UpdatePersonAsync(int id, PersonDto dto)
        {
            if (id != dto.Id) return false;
            var person = await _context.Person.FindAsync(id);
            if (person == null) return false;

            // Update properties
            person.FirstName = dto.FirstName;
            person.LastName = dto.LastName;
            person.Address = dto.Address;
            person.City = dto.City;
            person.PhoneNumber = dto.PhoneNumber;
            person.Email = dto.Email;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePersonAsync(int id)
        {
            var person = await _context.Person.FindAsync(id);
            if (person == null) return false;
            _context.Person.Remove(person);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
