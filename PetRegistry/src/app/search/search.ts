import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PetService } from '../Services/pet-service';
import { PersonService } from '../Services/person-service';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { PetDto, PersonDto } from '../domain/client';
import { RouterLink } from '@angular/router';
import { AgeService } from '../Services/Utils/age-service';
import { StringUtils } from '../Services/Utils/string-utils';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-search',
  imports: [FormsModule, RouterLink, TranslateModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Search implements OnInit, OnDestroy, AfterViewInit {
  private ageService = inject(AgeService);
  private petService = inject(PetService);
  private personService = inject(PersonService);
  private translateService = inject(TranslateService);
  private destroy$ = new Subject<void>();

  pets = signal<PetDto[]>([]);
  persons = signal<PersonDto[]>([]);
  filteredPets = signal<PetDto[]>([]);
  filteredPersons = signal<PersonDto[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  searchTerm = signal<string>('');

  @ViewChild('searchInput') searchInput!: ElementRef;

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
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
          this.error.set(this.translateService.instant('SEARCH.LOAD_ERROR'));
          this.isLoading.set(false);
        },
      });
  }

  getPetOwnerName(personId: number): string {
    const owner = this.persons().find((person) => person.id === personId);
    return owner
      ? owner.firstName + ' ' + owner.lastName
      : this.translateService.instant('SEARCH.UNKNOWN');
  }

  calculateAge(birthDate: string): number {
    return this.ageService.calculateAge(birthDate);
  }

  onSearchChange(searchTerm: string): void {
    const sanitizedTerm = StringUtils.sanitizeInput(searchTerm);

    if (sanitizedTerm.length > 50) {
      return;
    }

    this.searchTerm.set(sanitizedTerm);

    if (!sanitizedTerm.trim()) {
      // If search is empty, show all data
      this.filteredPets.set(this.pets());
      this.filteredPersons.set(this.persons());
      return;
    }

    const term = sanitizedTerm.toLowerCase().trim();

    const filteredPets = this.pets().filter(
      (pet) =>
        pet.name.toLowerCase().includes(term) ||
        (pet.breed && pet.breed.toLowerCase().includes(term)) ||
        (pet.species && pet.species.toLowerCase().includes(term))
    );

    const filteredPersons = this.persons().filter(
      (person) =>
        person.firstName.toLowerCase().includes(term) ||
        person.lastName.toLowerCase().includes(term)
    );

    this.filteredPets.set(filteredPets);
    this.filteredPersons.set(filteredPersons);
  }
}
