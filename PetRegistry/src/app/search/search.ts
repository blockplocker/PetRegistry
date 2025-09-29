import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PetService } from '../Services/pet-service';
import { PersonService } from '../Services/person-service';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { PetDto, PersonDto } from '../domain/client';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-search',
  imports: [FormsModule, RouterLink],
  templateUrl: './search.html',
  styleUrl: './search.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Search implements OnInit, OnDestroy {
  private petService = inject(PetService);
  private personService = inject(PersonService);
  private destroy$ = new Subject<void>();

  pets = signal<PetDto[]>([]);
  persons = signal<PersonDto[]>([]);
  filteredPets = signal<PetDto[]>([]);
  filteredPersons = signal<PersonDto[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  searchTerm = signal<string>('');

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData() {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      pets: this.petService.getAllPets(),
      persons: this.personService.getAllPersons(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ pets, persons }) => {
          this.pets.set(pets);
          this.persons.set(persons);
          this.filteredPets.set(pets);
          this.filteredPersons.set(persons);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.error.set('Failed to load data. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  getPetOwnerName(personId: number): string {
    const owner = this.persons().find((person) => person.id === personId);
    return owner ? owner.firstName : 'Unknown';
  }

  calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);

    if (!searchTerm.trim()) {
      // If search is empty, show all data
      this.filteredPets.set(this.pets());
      this.filteredPersons.set(this.persons());
      return;
    }

    const term = searchTerm.toLowerCase().trim();

    // Filter pets by name or breed
    const filteredPets = this.pets().filter(
      (pet) => 
        pet.name.toLowerCase().includes(term) || 
        (pet.breed && pet.breed.toLowerCase().includes(term))
    );

    // Filter persons by first name or last name
    const filteredPersons = this.persons().filter(
      (person) =>
        person.firstName.toLowerCase().includes(term) ||
        person.lastName.toLowerCase().includes(term)
    );

    this.filteredPets.set(filteredPets);
    this.filteredPersons.set(filteredPersons);
  }
}
