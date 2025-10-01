import { Component, inject, OnInit, signal } from '@angular/core';
import { PetService } from '../Services/pet-service';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { AppDialogComponent } from '../components/Dialog/Dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PetDto } from '../domain/client';
import { RouteParamService } from '../Services/Utils/route-param-service';
import { Subject, takeUntil } from 'rxjs';

const todayStr = new Date().toISOString().split('T')[0];

@Component({
  selector: 'app-pets',
  imports: [CommonModule, ReactiveFormsModule, DialogModule, FormsModule],
  templateUrl: './pets.html',
  styleUrl: './pets.css',
})
export class Pets implements OnInit {
  private route = inject(ActivatedRoute);
  private routeParamService = inject(RouteParamService);
  private fb = inject(FormBuilder);
  private petService = inject(PetService);
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
    const url = this.route.snapshot.url.map((segment) => segment.path).join('/');

    if (url.includes('edit')) {
      // Edit mode: pets/edit/:id (id is petId)
      this.isEditMode.set(true);
      const petId = this.routeParamService.getIdParam(this.route);
      if (petId !== null) {
        this.petId.set(petId);
      } else {
        this.error.set('Invalid pet ID');
      }
    } else {
      // Add mode: pets/:id (id is personId)
      this.isEditMode.set(false);
      const personId = this.routeParamService.getIdParam(this.route);
      if (personId !== null) {
        this.personId.set(personId);
        this.petForm.patchValue({ personId });
      } else {
        this.error.set('Invalid person ID');
      }
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
    if (this.petForm.invalid) return;

    const formValue = this.petForm.value;

    const pet = new PetDto({
      id: this.isEditMode() ? this.petId() : undefined,
      name: formValue.name,
      gender: formValue.gender,
      species: formValue.species,
      breed: formValue.breed || null,
      dateOfBirth: formValue.dateOfBirth.toString() || null,
      color: formValue.color || null,
      isMicrochip: formValue.isMicrochip === true,
      isNeutered: formValue.isNeutered === true,
      registrationDate: new Date(todayStr),
      personId: this.isEditMode() ? this.personId() : formValue.personId,
    });

    if (this.isEditMode()) {
      this.updatePet(pet);
    } else {
      this.createPet(pet);
    }
  }

  createPet(pet: PetDto) {
    this.petService
      .savePet(pet)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.petForm.reset({ personId: this.personId() });
        },
        error: () => {},
      });
  }

  updatePet(pet: PetDto) {
    this.petService
      .updatePet(this.petId(), pet)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {},
        error: () => {},
      });
  }
}
