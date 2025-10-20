import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PersonDto } from '../domain/client';
import { BaseStorageService, EntityFactory } from './base-storage-service';
import { LocalPetStorageService } from './local-pet-storage-service';

@Injectable({
  providedIn: 'root',
})
export class LocalPersonStorageService extends BaseStorageService<PersonDto> {
  petsStorageService: LocalPetStorageService = inject(LocalPetStorageService);
  protected readonly storageKey = 'persons_data';
  protected readonly entityFactory: EntityFactory<PersonDto> = PersonDto;

  getAllPersons(): Observable<PersonDto[]> {
    return this.getStorageData();
  }

  getPersonById(id: number): Observable<PersonDto> {
    return this.getEntityById(id);
  }

  savePerson(person: PersonDto): Observable<PersonDto> {
    return this.saveEntity(person);
  }

  updatePerson(id: number, person: PersonDto): Observable<void> {
    return this.updateEntity(id, person);
  }

  deletePerson(id: number): Observable<void> {
    return this.petsStorageService.deletePetsByOwnerId(id).pipe(
      switchMap(() => this.deleteEntity(id))
    );
  }
}
