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
import { RouteParamService } from '../Services/Utils/route-param-service';

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
  private dialog = inject(Dialog);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private routeParamService = inject(RouteParamService);
  private destroy$ = new Subject<void>();

  personId = signal<number>(0);
  person = signal<PersonDto | null>(null);
  pets = signal<PetDto[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.isLoading.set(true);
    const personId = this.routeParamService.getIdParam(this.route);

    if (personId !== null) {
      this.personId.set(personId);
      this.loadPersonDetails();
    } else {
      this.error.set('Invalid person ID.');
      this.isLoading.set(false);
    }
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPersonDetails() {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      pets: this.petService.getPetsByPersonId(this.personId()),
      person: this.personService.getPersonById(this.personId()),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ pets, person }) => {
          this.pets.set(pets);
          this.person.set(person);
          this.isLoading.set(false);
        },
        error: () => {
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

    if (!person) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Bekräfta radering',
        message: `Är du säker på att du vill radera ${person.firstName} ${person.lastName}?`,
        confirmText: 'Radera',
        cancelText: 'Avbryt',
      },
    });
    ref.closed.subscribe((confirmed) => {
      if (confirmed) {
        this.performDelete(this.personId());
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
              title: 'Raderad!',
              message: 'Personen har raderats',
            },
          });
          this.router.navigate(['/search']);
        },
        error: () => {
          this.isLoading.set(false);
          this.dialog.open(AppDialogComponent, {
            data: {
              title: 'Fel',
              message: `Kunde inte radera person. Försök igen senare.`,
            },
          });
        },
      });
  }
}
