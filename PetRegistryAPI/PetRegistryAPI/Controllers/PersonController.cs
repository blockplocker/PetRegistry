using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PetRegistryAPI.Dto;
using PetRegistryAPI.Interfaces;

namespace PetRegistryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PersonController(IPersonService personService) : ControllerBase
    {

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<PersonDto>>> GetPerson()
        {
            var people = await personService.GetAllPeopleAsync();
            return Ok(people);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<PersonDto>> GetPerson(int id)
        {
            var personDto = await personService.GetPersonAsync(id);
            if (personDto == null)
            {
                return NotFound();
            }
            return Ok(personDto);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> PutPerson(int id, PersonDto personDto)
        {
            if (id != personDto.Id)
            {
                return BadRequest();
            }

            var updated = await personService.UpdatePersonAsync(id, personDto);
            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<ActionResult<PersonDto>> PostPerson(PersonDto personDto)
        {
            var created = await personService.CreatePersonAsync(personDto);
            return CreatedAtAction(nameof(GetPerson), new { id = created.Id }, created);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> DeletePerson(int id)
        {
            var deleted = await personService.DeletePersonAsync(id);
            if (!deleted)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}
