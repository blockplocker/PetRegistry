import { inject, Injectable } from '@angular/core';
import { Client, PersonDto } from '../domain/client';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private client = inject(Client);

  getAllPersons() {
    return this.client.personAll();
  }
  getPersonById(id: number) {
    return this.client.personGET(id);
  }
  savePerson(person: PersonDto) {
    return this.client.personPOST(person);
  }
  updatePerson(id: number, person: PersonDto) {
    return this.client.personPUT(id, person);
  }
  deletePerson(id: number) {
    return this.client.personDELETE(id);
  }
}
