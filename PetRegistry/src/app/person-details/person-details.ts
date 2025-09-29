import { Component, computed, inject, Input, signal } from '@angular/core';
import { PersonDto, PetDto } from '../domain/client';
import { Subject } from 'rxjs/internal/Subject';
import { PersonService } from '../Services/person-service';
import { PetService } from '../Services/pet-service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-person-details',
  imports: [],
  templateUrl: './person-details.html',
  styleUrl: './person-details.css'
})
export class PersonDetails {
  private petService = inject(PetService);
  private personService = inject(PersonService);
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  readonly personId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
  
  person = signal<PersonDto | null>(null);
  pets = signal<PetDto[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    // Logic to fetch and display person details based on personId
    this.loadPersonDetails();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPersonDetails() {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      pets: this.petService.getAllPets(),
      person: this.personService.getPersonById(Number(this.personId())).pipe(takeUntil(this.destroy$))
    }).subscribe({
      next: ({ pets, person }) => {
        this.pets.set(pets);
        this.person.set(person);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load person details');
        this.isLoading.set(false);
      }
    });
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
} 