import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { PetService } from '../Services/pet-service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PetDto } from '../domain/client';
import { ToastrService } from 'ngx-toastr';
import { RouteParamService } from '../Services/Utils/route-param-service';
import { ValidationPatterns } from '../Services/Utils/validation-patterns-service';
import { StringUtils } from '../Services/Utils/string-utils';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pets',
  imports: [CommonModule, ReactiveFormsModule, DialogModule, TranslateModule],
  templateUrl: './pets.html',
  styleUrl: './pets.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pets implements OnInit, OnDestroy, AfterViewInit {
  private petService = inject(PetService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private routeParamService = inject(RouteParamService);
  private toastr = inject(ToastrService);
  private translateService = inject(TranslateService);
  private validationPatterns = inject(ValidationPatterns);
  private destroy$ = new Subject<void>();

  isEditMode = signal(false);
  personId = signal<number>(0);
  petId = signal<number>(0);
  isLoading = signal(false);
  error = signal<string | null>(null);

  @ViewChild('firstInput') firstInput!: ElementRef;

  today = new Date().toISOString().substring(0, 10);

  petForm = new FormGroup({
    name: new FormControl('', {
      validators: this.validationPatterns.name(15),
      nonNullable: true,
    }),
    species: new FormControl('', {
      validators: this.validationPatterns.name(15),
      nonNullable: true,
    }),
    breed: new FormControl('', {
      validators: this.validationPatterns.optionalName(15),
      nonNullable: true,
    }),
    dateOfBirth: new FormControl('', { nonNullable: true }),
    color: new FormControl('', {
      validators: this.validationPatterns.optionalName(15),
      nonNullable: true,
    }),
    gender: new FormControl('Female', { validators: [Validators.required], nonNullable: true }),
    isMicrochip: new FormControl(false, { validators: [Validators.required], nonNullable: true }),
    isNeutered: new FormControl(false, { validators: [Validators.required], nonNullable: true }),
    personId: new FormControl(0, { validators: [Validators.required], nonNullable: true }),
  });

  ngOnInit() {
    this.determineMode();
    if (this.isEditMode()) {
      this.loadPetForEdit();
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

  private determineMode() {
    const routeData = this.route.snapshot.data;
    const mode = routeData['mode'];

    if (mode === 'edit') {
      this.getPetId();
    } else {
      this.getPersonId();
    }
  }

  getPetId() {
    this.isEditMode.set(true);
    const petId = this.routeParamService.getIdParam(this.route);
    if (petId !== null) {
      this.petId.set(petId);
    } else {
      this.translateService
        .get('COMMON.INVALID_ID')
        .pipe(takeUntil(this.destroy$))
        .subscribe((translation) => {
          this.error.set(translation);
        });
    }
  }

  getPersonId() {
    this.isEditMode.set(false);
    const personId = this.routeParamService.getIdParam(this.route);
    if (personId !== null) {
      this.personId.set(personId);
      this.petForm.patchValue({ personId });
    } else {
      this.translateService
        .get('COMMON.INVALID_ID')
        .pipe(takeUntil(this.destroy$))
        .subscribe((translation) => {
          this.error.set(translation);
        });
    }
  }

  private loadPetForEdit() {
    this.isLoading.set(true);
    this.petService
      .getPetById(this.petId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pet) => {
          this.personId.set(pet.personId);
          this.populateForm(pet);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.error.set(this.translateService.instant('COMMON.PET_LOAD_ERROR'));
        },
      });
  }

  populateForm(pet: PetDto) {
    this.petForm.patchValue({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      dateOfBirth: pet.dateOfBirth ? pet.dateOfBirth.split('T')[0] : '',
      color: pet.color || '',
      gender: pet.gender,
      isMicrochip: pet.isMicrochip,
      isNeutered: pet.isNeutered,
      personId: pet.personId,
    });
  }

  savePet() {
    if (this.petForm.invalid) {
      this.petForm.markAllAsTouched();
      return;
    }

    // Sanitize all string inputs
    const sanitizedName = StringUtils.sanitizeInput(this.petForm.controls.name.value);
    const sanitizedSpecies = StringUtils.sanitizeInput(this.petForm.controls.species.value);
    const sanitizedBreed = this.petForm.controls.breed.value
      ? StringUtils.sanitizeInput(this.petForm.controls.breed.value)
      : undefined;
    const sanitizedColor = this.petForm.controls.color.value
      ? StringUtils.sanitizeInput(this.petForm.controls.color.value)
      : undefined;

    // Validate sanitized inputs
    if (!sanitizedName || !sanitizedSpecies) {
      this.toastr.error(
        this.translateService.instant('COMMON.INVALID_INPUT_DATA'),
        this.translateService.instant('COMMON.ERROR')
      );
      return;
    }

    const pet = new PetDto({
      id: this.isEditMode() ? this.petId() : undefined,
      name: StringUtils.capitalizeFirst(sanitizedName),
      gender: this.petForm.controls.gender.value,
      species: StringUtils.capitalizeFirst(sanitizedSpecies),
      breed: sanitizedBreed ? StringUtils.capitalizeFirst(sanitizedBreed) : undefined,
      dateOfBirth: this.petForm.controls.dateOfBirth.value || undefined,
      color: sanitizedColor ? StringUtils.capitalizeFirst(sanitizedColor) : undefined,
      isMicrochip: this.petForm.controls.isMicrochip.value,
      isNeutered: this.petForm.controls.isNeutered.value,
      registrationDate: new Date(this.today),
      personId: this.isEditMode() ? this.personId() : this.petForm.controls.personId.value,
    });

    if (this.isEditMode()) {
      this.updatePet(pet);
    } else {
      this.createPet(pet);
    }
  }

  createPet(pet: PetDto) {
    this.isLoading.set(true);

    this.petService
      .savePet(pet)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdPet) => {
          this.toastr.success(
            this.translateService.instant('COMMON.PET_SAVED'),
            this.translateService.instant('COMMON.SAVED')
          );
          this.router.navigate(['/pet-details', createdPet.id]);
        },
        error: () => {
          this.isLoading.set(false);
          this.toastr.error(
            this.translateService.instant('COMMON.PET_SAVE_ERROR'),
            this.translateService.instant('COMMON.ERROR')
          );
        },
      });
  }

  updatePet(pet: PetDto) {
    this.isLoading.set(true);

    this.petService
      .updatePet(this.petId(), pet)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toastr.success(
            this.translateService.instant('COMMON.PET_UPDATED'),
            this.translateService.instant('COMMON.UPDATED')
          );
          this.router.navigate(['/pet-details', this.petId()]);
        },
        error: () => {
          this.isLoading.set(false);
          this.toastr.error(
            this.translateService.instant('COMMON.PET_UPDATE_ERROR'),
            this.translateService.instant('COMMON.ERROR')
          );
        },
      });
  }

  getFieldErrorMessage(fieldName: string): string {
    const control = this.petForm.get(fieldName);
    if (control && control.errors && control.touched) {
      const fieldDisplayName = this.validationPatterns.getFieldName(fieldName);
      return this.validationPatterns.getValidationErrorMessage(fieldDisplayName, control.errors);
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.petForm.get(fieldName);
    return !!(control && control.errors && control.touched);
  }
}
