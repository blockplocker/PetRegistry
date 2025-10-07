using PetRegistryAPI.Dto;

namespace PetRegistryAPI.Interfaces
{
    public interface IPersonService
    {
        Task<PersonDto> CreatePersonAsync(PersonDto dto);
        Task<PersonDto?> GetPersonAsync(int id);
        Task<IEnumerable<PersonDto>> GetAllPeopleAsync();
        Task<bool> UpdatePersonAsync(int id, PersonDto dto);
        Task<bool> DeletePersonAsync(int id);
    }
}
