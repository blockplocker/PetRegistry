import { inject, Injectable } from '@angular/core';
import { Client, PetDto } from '../domain/client';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LocalPetStorageService } from './local-pet-storage-service';

@Injectable({
  providedIn: 'root',
})
export class PetService {
  private client = inject(Client);
  private localStorageService = inject(LocalPetStorageService);
  private useLocalStorage = environment.useLocalStorage;

  setStorageMode(useLocalStorage: boolean) {
    this.useLocalStorage = useLocalStorage;
  }

  getStorageMode(): boolean {
    return this.useLocalStorage;
  }

  getAllPets(): Observable<PetDto[]> {
    if (this.useLocalStorage) {
      return this.localStorageService.getAllPets();
    }
    return this.client.petAll();
  }

  getPetById(id: number): Observable<PetDto> {
    if (this.useLocalStorage) {
      return this.localStorageService.getPetById(id);
    }
    return this.client.petGET(id);
  }

  getPetsByPersonId(personId: number): Observable<PetDto[]> {
    if (this.useLocalStorage) {
      return this.localStorageService.getPetsByPersonId(personId);
    }
    return this.client
      .petAll()
      .pipe(map((pets) => pets.filter((pet) => pet.personId === personId)));
  }

  savePet(pet: PetDto): Observable<PetDto> {
    if (this.useLocalStorage) {
      return this.localStorageService.savePet(pet);
    }
    return this.client.petPOST(pet);
  }

  updatePet(id: number, pet: PetDto): Observable<void> {
    if (this.useLocalStorage) {
      return this.localStorageService.updatePet(id, pet);
    }
    return this.client.petPUT(id, pet);
  }

  deletePet(id: number): Observable<void> {
    if (this.useLocalStorage) {
      return this.localStorageService.deletePet(id);
    }
    return this.client.petDELETE(id);
  }

  // Utility methods for data management
  clearLocalStorage(): void {
    this.localStorageService.clearStorage();
  }

  syncFromApiToLocalStorage(): Observable<void> {
    return new Observable((observer) => {
      this.client.petAll().subscribe({
        next: (pets) => {
          this.localStorageService.setData(pets);
          observer.next();
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }
}
