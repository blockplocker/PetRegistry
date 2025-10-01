import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { PersonDto, PetDto } from '../domain/client';
import { Subject } from 'rxjs/internal/Subject';
import { PersonService } from '../Services/person-service';
import { PetService } from '../Services/pet-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { forkJoin } from 'rxjs';
import { AgeService } from '../Services/Utils/age-service';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmDialogComponent } from '../components/Dialog/confirm-dialog/confirm-dialog';
import { AppDialogComponent } from '../components/Dialog/Dialog';

@Component({
  selector: 'app-person-details',
  imports: [RouterLink],
  templateUrl: './person-details.html',
  styleUrl: './person-details.css',
})
export class PersonDetails implements OnInit, OnDestroy {
  private ageService = inject(AgeService);
  private petService = inject(PetService);
  private personService = inject(PersonService);
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(Dialog);
  readonly personId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');

  person = signal<PersonDto | null>(null);
  pets = signal<PetDto[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadPersonDetails();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPersonDetails() {
    this.isLoading.set(true);
    this.error.set(null);

    const personIdNum = Number(this.personId());

    forkJoin({
      pets: this.petService.getPetsByPersonId(personIdNum),
      person: this.personService.getPersonById(personIdNum),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ pets, person }) => {
          this.pets.set(pets);
          this.person.set(person);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load person details');
          this.isLoading.set(false);
        },
      });
  }
  calculateAge(birthDate: string): number {
    return this.ageService.calculateAge(birthDate);
  }

  deletePerson() {
    const person = this.person();
    const personId = Number(this.personId());

    if (!Number.isFinite(personId) || !person) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Bekräfta radering',
        message: `Är du säker på att du vill radera ${person.firstName} ${person.lastName}?`,
        confirmText: 'Radera',
        cancelText: 'Avbryt',
      },
    });
    ref.closed.subscribe((confirmed) => {
      console.log('Confirm result:', confirmed);
      if (confirmed) {
        this.performDelete(personId);
      }
    });
  }

  private performDelete(personId: number) {
    this.isLoading.set(true);

    this.personService
      .deletePerson(personId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.dialog.open(AppDialogComponent, {
            data: {
              title: 'Raderat!',
              message: 'Personen har raderats',
            },
          });
          this.router.navigate(['/persons']);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.dialog.open(AppDialogComponent, {
            data: {
              title: 'Fel',
              message: `Kunde inte radera personen. Försök igen senare.`,
            },
          });
        },
      });
  }
}
