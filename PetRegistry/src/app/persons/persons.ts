import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { PersonService } from '../Services/person-service';
import { PersonDto } from '../domain/client';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';
import { StringUtils } from '../Services/Utils/string-utils';
import { ValidationPatterns } from '../Services/Utils/validation-patterns-service';
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
  styleUrls: ['./persons.css'],
})
export class Persons implements OnInit, OnDestroy, AfterViewInit {
  private personService = inject(PersonService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private routeParamService = inject(RouteParamService);
  private toastr = inject(ToastrService);
  private translateService = inject(TranslateService);
  private validationPatterns = inject(ValidationPatterns);
  private destroy$ = new Subject<void>();

  personId = signal<number>(0);

  person = signal<PersonDto | null>(null);
  isEditing = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  @ViewChild('firstInput') firstInput!: ElementRef;

  personForm!: FormGroup;

  ngOnInit() {
    this.personForm = new FormGroup({
      firstName: new FormControl('', {
        validators: this.validationPatterns.name(15),
        nonNullable: true,
      }),
      lastName: new FormControl('', {
        validators: this.validationPatterns.name(20),
        nonNullable: true,
      }),
      address: new FormControl('', {
        validators: this.validationPatterns.address(25),
        nonNullable: true,
      }),
      city: new FormControl('', {
        validators: this.validationPatterns.name(25),
        nonNullable: true,
      }),
      phoneNumber: new FormControl('', {
        validators: this.validationPatterns.phone(10, 15),
        nonNullable: true,
      }),
      email: new FormControl('', {
        validators: this.validationPatterns.email(),
        nonNullable: true,
      }),
    });

    const personId = this.routeParamService.getIdParam(this.route);
    if (personId !== null) {
      this.personId.set(personId);
      this.isEditing.set(true);
      this.loadPerson(personId);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    if (this.firstInput) {
      this.firstInput.nativeElement.focus();
    }
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

    const sanitizedFirstName = StringUtils.sanitizeInput(
      this.personForm.controls['firstName'].value
    );
    const sanitizedLastName = StringUtils.sanitizeInput(this.personForm.controls['lastName'].value);
    const sanitizedAddress = StringUtils.sanitizeInput(this.personForm.controls['address'].value);
    const sanitizedCity = StringUtils.sanitizeInput(this.personForm.controls['city'].value);
    const sanitizedPhoneNumber = StringUtils.sanitizeInput(
      this.personForm.controls['phoneNumber'].value
    );
    const sanitizedEmail = StringUtils.sanitizeInput(this.personForm.controls['email'].value);

    if (
      !sanitizedFirstName ||
      !sanitizedLastName ||
      !sanitizedAddress ||
      !sanitizedCity ||
      !sanitizedPhoneNumber ||
      !sanitizedEmail
    ) {
      this.toastr.error(
        this.translateService.instant('COMMON.INVALID_INPUT_DATA'),
        this.translateService.instant('COMMON.ERROR')
      );
      return;
    }

    const person = new PersonDto({
      id: this.isEditing() ? this.personId() : undefined,
      firstName: StringUtils.capitalizeFirst(sanitizedFirstName),
      lastName: StringUtils.capitalizeFirst(sanitizedLastName),
      address: StringUtils.capitalizeFirst(sanitizedAddress),
      city: StringUtils.capitalizeFirst(sanitizedCity),
      phoneNumber: sanitizedPhoneNumber,
      email: sanitizedEmail,
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
            this.translateService.instant('COMMON.UPDATED')
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

  getFieldErrorMessage(fieldName: string): string {
    const control = this.personForm.get(fieldName);
    if (control && control.errors && control.touched) {
      const fieldDisplayName = this.validationPatterns.getFieldName(fieldName);
      return this.validationPatterns.getValidationErrorMessage(fieldDisplayName, control.errors);
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.personForm.get(fieldName);
    return !!(control && control.errors && control.touched);
  }
}
