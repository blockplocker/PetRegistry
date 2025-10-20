import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PetDto } from '../domain/client';
import { BaseStorageService, EntityFactory } from './base-storage-service';

@Injectable({
  providedIn: 'root',
})
export class LocalPetStorageService extends BaseStorageService<PetDto> {
  protected readonly storageKey = 'pets_data';
  protected readonly entityFactory: EntityFactory<PetDto> = PetDto;

  getAllPets(): Observable<PetDto[]> {
    return this.getStorageData();
  }

  getPetById(id: number): Observable<PetDto> {
    return this.getEntityById(id);
  }

  getPetsByPersonId(personId: number): Observable<PetDto[]> {
    return this.getStorageData().pipe(
      map((pets) => pets.filter((pet) => pet.personId === personId))
    );
  }

  savePet(pet: PetDto): Observable<PetDto> {
    return this.saveEntity(pet);
  }

  updatePet(id: number, pet: PetDto): Observable<void> {
    return this.updateEntity(id, pet);
  }

  deletePet(id: number): Observable<void> {
    return this.deleteEntity(id);
  }

  deletePetsByOwnerId(ownerId: number): Observable<void> {
    return this.getStorageData().pipe(
      map((pets) => pets.filter((pet) => pet.personId === ownerId && pet.id !== undefined)),
      switchMap((petsToDelete) => {
        if (!petsToDelete.length) return of(void 0);

        const deletes: Observable<void>[] = petsToDelete
          .map((p) => p.id as number)
          .map((id) => this.deleteEntity(id));
        return forkJoin(deletes).pipe(map(() => void 0));
      })
    );
  }
}
