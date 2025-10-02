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


@Component({
  selector: 'app-pets',
  imports: [CommonModule, ReactiveFormsModule, DialogModule],
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
        this.error.set('Invalid pet ID');
      }
  }

  getPersonId() {
    this.isEditMode.set(false);
      const personId = this.routeParamService.getIdParam(this.route);
      if (personId !== null) {
        this.personId.set(personId);
        this.petForm.patchValue({ personId });
      } else {
        this.error.set('Invalid person ID');
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
          this.error.set('Kunde inte ladda djurdata. Försök igen.');
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

    const formValue = this.petForm.value;

    const pet = new PetDto({
      id: this.isEditMode() ? this.petId() : undefined,
      name: formValue.name,
      gender: formValue.gender,
      species: formValue.species,
      breed: formValue.breed || null,
      dateOfBirth: formValue.dateOfBirth || null,
      color: formValue.color || null,
      isMicrochip: formValue.isMicrochip,
      isNeutered: formValue.isNeutered,
      registrationDate: new Date(this.today),
      personId: this.isEditMode() ? this.personId() : formValue.personId,
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
        next: () => {
          this.initializeForm();
          this.petForm.patchValue({ personId: this.personId() });
          this.isLoading.set(false);
          this.toastr.success('Djuret har sparats!', 'Sparat!');
        },
        error: () => {
          this.isLoading.set(false);
          this.toastr.error('Fel vid sparning. Försök igen senare.', 'Fel');
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
          this.toastr.success('Updateringen har sparats!', 'Updaterat!');
          this.router.navigate(['/pet-details', this.petId()]);
        },
        error: () => {
          this.isLoading.set(false);
          this.toastr.error('Fel vid updatering. Försök igen senare.', 'Fel');

        },
      });
  }
}
