import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { PetService } from '../Services/pet-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PetDto } from '../domain/client';
import { ToastrService } from 'ngx-toastr';
import { RouteParamService } from '../Services/Utils/route-param-service';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pets',
  imports: [CommonModule, ReactiveFormsModule, DialogModule, TranslateModule],
  templateUrl: './pets.html',
  styleUrl: './pets.css',
})
export class Pets implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private petService = inject(PetService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private routeParamService = inject(RouteParamService);
  private toastr = inject(ToastrService);
  private translateService = inject(TranslateService);
  private destroy$ = new Subject<void>();

  isEditMode = signal(false);
  personId = signal<number>(0);
  petId = signal<number>(0);
  isLoading = signal(false);
  error = signal<string | null>(null);

  today = new Date().toISOString().substring(0, 10);
  petForm!: FormGroup;

  ngOnInit() {
    this.initializeForm();
    this.determineMode();
    if (this.isEditMode()) {
      this.loadPetForEdit();
    }
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    this.petForm = this.fb.group({
      name: ['', Validators.required],
      species: ['', Validators.required],
      breed: [''],
      dateOfBirth: [''],
      color: [''],
      gender: ['Female', Validators.required],
      isMicrochip: [false, Validators.required],
      isNeutered: [false, Validators.required],
      personId: [0, Validators.required],
    });
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
      this.error.set(this.translateService.instant('COMMON.INVALID_ID'));
    }
  }

  getPersonId() {
    this.isEditMode.set(false);
    const personId = this.routeParamService.getIdParam(this.route);
    if (personId !== null) {
      this.personId.set(personId);
      this.petForm.patchValue({ personId });
    } else {
      this.error.set(this.translateService.instant('COMMON.INVALID_ID'));
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
      breed: pet.breed,
      dateOfBirth: pet.dateOfBirth ? pet.dateOfBirth.split('T')[0] : '',
      color: pet.color,
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

    const pet = new PetDto({
      id: this.isEditMode() ? this.petId() : undefined,
      name: this.petForm.get('name')!.value,
      gender: this.petForm.get('gender')!.value,
      species: this.petForm.get('species')!.value,
      breed: this.petForm.get('breed')!.value || null,
      dateOfBirth: this.petForm.get('dateOfBirth')!.value || null,
      color: this.petForm.get('color')!.value || null,
      isMicrochip: this.petForm.get('isMicrochip')!.value,
      isNeutered: this.petForm.get('isNeutered')!.value,
      registrationDate: new Date(this.today),
      personId: this.isEditMode() ? this.personId() : this.petForm.get('personId')!.value,
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
          this.initializeForm();
          this.petForm.patchValue({ personId: this.personId() });
          this.isLoading.set(false);
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
}
