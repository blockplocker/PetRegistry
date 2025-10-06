using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PetRegistryAPI.Dto;
using PetRegistryAPI.Services;

namespace PetRegistryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PetController : ControllerBase
    {
        private readonly PetService _petService;

        public PetController(PetService petService)
        {
            _petService = petService;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<PetDto>>> GetPet()
        {
            var pets = await _petService.GetAllPetsAsync();
            return Ok(pets);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<PetDto>> GetPet(int id)
        {
            var petDto = await _petService.GetPetAsync(id);
            if (petDto == null)
            {
                return NotFound();
            }
            return Ok(petDto);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> PutPet(int id, PetDto petDto)
        {
            if (id != petDto.Id)
            {
                return BadRequest();
            }

            var updated = await _petService.UpdatePetAsync(id, petDto);
            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<ActionResult<PetDto>> PostPet([FromBody]PetDto petDto)
        {
            var created = await _petService.CreatePetAsync(petDto);
            return CreatedAtAction(nameof(GetPet), new { id = created.Id }, created);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> DeletePet(int id)
        {
            var deleted = await _petService.DeletePetAsync(id);
            if (!deleted)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}
