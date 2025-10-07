using PetRegistryAPI.Dto;

namespace PetRegistryAPI.Interfaces
{
    public interface IPetService
    {
        Task<IEnumerable<PetDto>> GetAllPetsAsync();
        Task<PetDto?> GetPetAsync(int id);
        Task<PetDto> CreatePetAsync(PetDto dto);
        Task<bool> UpdatePetAsync(int id, PetDto dto);
        Task<bool> DeletePetAsync(int id);
    }
}
