import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { PersonService } from '../Services/person-service';
import { PersonDto } from '../domain/client';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';
import { StringUtils } from '../Services/string-utils';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { ToastrService } from 'ngx-toastr';
import { RouteParamService } from '../Services/Utils/route-param-service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-persons',
  imports: [ReactiveFormsModule, DialogModule, TranslateModule],
  templateUrl: './persons.html',
  standalone: true,
  styleUrls: ['./persons.css'],
})
export class Persons implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private personService = inject(PersonService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private routeParamService = inject(RouteParamService);
  private destroy$ = new Subject<void>();
  private toastr = inject(ToastrService);
  private translateService = inject(TranslateService);

  personId = signal<number>(0);

  person = signal<PersonDto | null>(null);
  isEditing = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  personForm!: FormGroup;

  ngOnInit() {
    this.initializeForm();

    const personId = this.routeParamService.getIdParam(this.route);
    if (personId !== null) {
      this.personId.set(personId);
      this.isEditing.set(true);
      this.loadPerson(Number(personId));
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    this.personForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  private loadPerson(personId: number) {
    this.isLoading.set(true);
    this.error.set(null);

    this.personService
      .getPersonById(personId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (person) => {
          if (person) {
            this.person.set(person);
            this.populateForm(person);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set(this.translateService.instant('COMMON.PERSON_LOAD_ERROR'));
          this.isLoading.set(false);
        },
      });
  }

  private populateForm(person: PersonDto) {
    this.personForm.setValue({
      firstName: person.firstName || '',
      lastName: person.lastName || '',
      address: person.address || '',
      city: person.city || '',
      phoneNumber: person.phoneNumber || '',
      email: person.email || '',
    });
  }

  savePerson() {
    if (this.personForm.invalid) {
      this.personForm.markAllAsTouched();
      return;
    }

    const formValue = this.personForm.value;

    const person = new PersonDto({
      id: this.isEditing() ? Number(this.personId()) : undefined,
      firstName: StringUtils.capitalizeFirst(formValue.firstName),
      lastName: StringUtils.capitalizeFirst(formValue.lastName),
      address: StringUtils.capitalizeFirst(formValue.address),
      city: StringUtils.capitalizeFirst(formValue.city),
      phoneNumber: formValue.phoneNumber,
      email: formValue.email,
    });

    if (this.isEditing()) {
      this.updatePerson(person);
    } else {
      this.createPerson(person);
    }
  }

  createPerson(person: PersonDto) {
    this.isLoading.set(true);

    this.personService
      .savePerson(person)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdPerson) => {
          this.isLoading.set(false);
          this.toastr.success(
            this.translateService.instant('COMMON.PERSON_CREATED'),
            this.translateService.instant('COMMON.SUCCESS')
          );
          this.router.navigate(['/person-details', createdPerson.id]);
        },
        error: () => {
          this.isLoading.set(false);
          this.toastr.error(
            this.translateService.instant('COMMON.PERSON_CREATE_ERROR'),
            this.translateService.instant('COMMON.ERROR')
          );
        },
      });
  }

  updatePerson(person: PersonDto) {
    this.isLoading.set(true);

    this.personService
      .updatePerson(this.personId(), person)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toastr.success(
            this.translateService.instant('COMMON.PERSON_UPDATED'),
            this.translateService.instant('COMMON.SUCCESS')
          );
          this.router.navigate(['/person-details', this.personId()]);
        },
        error: () => {
          this.isLoading.set(false);
          this.toastr.error(
            this.translateService.instant('COMMON.PERSON_UPDATE_ERROR'),
            this.translateService.instant('COMMON.ERROR')
          );
        },
      });
  }
}
