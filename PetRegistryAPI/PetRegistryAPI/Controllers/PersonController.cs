using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PetRegistryAPI.Dto;
using PetRegistryAPI.Services;

namespace PetRegistryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PersonController : ControllerBase
    {
        private readonly PersonService _personService;

        public PersonController(PersonService personService)
        {
            _personService = personService;
        }

        // GET: api/Person
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<PersonDto>>> GetPerson()
        {
            var people = await _personService.GetAllPeopleAsync();
            return Ok(people);
        }

        // GET: api/Person/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<PersonDto>> GetPerson(int id)
        {
            var personDto = await _personService.GetPersonAsync(id);
            if (personDto == null)
            {
                return NotFound();
            }
            return Ok(personDto);
        }

        // PUT: api/Person/5
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> PutPerson(int id, PersonDto personDto)
        {
            if (id != personDto.Id)
            {
                return BadRequest();
            }

            var updated = await _personService.UpdatePersonAsync(id, personDto);
            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }

        // POST: api/Person
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<ActionResult<PersonDto>> PostPerson(PersonDto personDto)
        {
            var created = await _personService.CreatePersonAsync(personDto);
            return CreatedAtAction(nameof(GetPerson), new { id = created.Id }, created);
        }

        // DELETE: api/Person/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> DeletePerson(int id)
        {
            var deleted = await _personService.DeletePersonAsync(id);
            if (!deleted)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}
