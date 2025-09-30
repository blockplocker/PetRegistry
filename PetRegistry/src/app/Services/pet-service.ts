import { inject, Injectable } from '@angular/core';
import { Client, PetDto } from '../domain/client';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PetService {
  private client = inject(Client);

  getAllPets() {
    return this.client.petAll();
  }

  getPetById(id: number) {
    return this.client.petGET(id);
  }

  getPetsByPersonId(personId: number) {
    return this.client
      .petAll()
      .pipe(map((pets) => pets.filter((pet) => pet.personId === personId)));
  }

  savePet(pet: PetDto) {
    return this.client.petPOST(pet);
  }

  updatePet(id: number, pet: PetDto) {
    return this.client.petPUT(id, pet);
  }

  deletePet(id: number) {
    return this.client.petDELETE(id);
  }
}
