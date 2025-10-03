import { inject, Injectable } from '@angular/core';
import { Client, PersonDto } from '../domain/client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LocalPersonStorageService } from './local-person-storage-service';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  private client = inject(Client);
  private localStorageService = inject(LocalPersonStorageService);
  private useLocalStorage = environment.useLocalStorage;

  setStorageMode(useLocalStorage: boolean) {
    this.useLocalStorage = useLocalStorage;
  }

  getStorageMode(): boolean {
    return this.useLocalStorage;
  }

  getAllPersons(): Observable<PersonDto[]> {
    if (this.useLocalStorage) {
      return this.localStorageService.getAllPersons();
    }
    return this.client.personAll();
  }

  getPersonById(id: number): Observable<PersonDto> {
    if (this.useLocalStorage) {
      return this.localStorageService.getPersonById(id);
    }
    return this.client.personGET(id);
  }

  savePerson(person: PersonDto): Observable<PersonDto> {
    if (this.useLocalStorage) {
      return this.localStorageService.savePerson(person);
    }
    return this.client.personPOST(person);
  }

  updatePerson(id: number, person: PersonDto): Observable<void> {
    if (this.useLocalStorage) {
      return this.localStorageService.updatePerson(id, person);
    }
    return this.client.personPUT(id, person);
  }

  deletePerson(id: number): Observable<void> {
    if (this.useLocalStorage) {
      return this.localStorageService.deletePerson(id);
    }
    return this.client.personDELETE(id);
  }

  // Utility methods for data management
  clearLocalStorage(): void {
    this.localStorageService.clearStorage();
  }

  syncFromApiToLocalStorage(): Observable<void> {
    return new Observable((observer) => {
      this.client.personAll().subscribe({
        next: (persons) => {
          this.localStorageService.setData(persons);
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
