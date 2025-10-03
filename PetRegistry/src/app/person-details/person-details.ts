import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
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
import { RouteParamService } from '../Services/Utils/route-param-service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-person-details',
  imports: [RouterLink, TranslateModule],
  templateUrl: './person-details.html',
  styleUrl: './person-details.css',
})
export class PersonDetails implements OnInit, OnDestroy {
  private ageService = inject(AgeService);
  private petService = inject(PetService);
  private personService = inject(PersonService);
  private dialog = inject(Dialog);
  private toastr = inject(ToastrService);
  private routeParamService = inject(RouteParamService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translateService = inject(TranslateService);
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
      this.translateService
        .get('COMMON.INVALID_ID')
        .pipe(takeUntil(this.destroy$))
        .subscribe((translation) => {
          this.error.set(translation);
          this.isLoading.set(false);
        });
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
          this.error.set(this.translateService.instant('COMMON.PERSON_LOAD_ERROR'));
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
        title: this.translateService.instant('COMMON.CONFIRM_DELETION'),
        message: this.translateService.instant('COMMON.PERSON_DELETE_CONFIRMATION_MESSAGE', {
          firstName: person.firstName,
          lastName: person.lastName,
        }),
        confirmText: this.translateService.instant('COMMON.DELETE'),
        cancelText: this.translateService.instant('COMMON.CANCEL'),
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
          this.toastr.success(
            this.translateService.instant('COMMON.PERSON_DELETED'),
            this.translateService.instant('COMMON.DELETE_SUCCESS')
          );
          this.router.navigate(['/search']);
        },
        error: () => {
          this.isLoading.set(false);
          this.toastr.error(
            this.translateService.instant('COMMON.PERSON_DELETE_ERROR'),
            this.translateService.instant('COMMON.DELETE_ERROR')
          );
        },
      });
  }
}
