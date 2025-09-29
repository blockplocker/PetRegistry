import { Component } from '@angular/core';
import { PetService } from '../Services/pet-service';
import { PersonDto } from '../domain/client';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { AppDialogComponent } from '../components/Dialog/Dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pets',

  imports: [CommonModule, ReactiveFormsModule, DialogModule, FormsModule],
  templateUrl: './pets.html',
  styleUrl: './pets.css',
  standalone: true,
})
export class Pets {
  petForm!: FormGroup;
  constructor(private fb: FormBuilder, private petService: PetService, private dialog: Dialog) {
    this.petForm = this.fb.group({
      Name: ['', Validators.required],
      Species: ['', Validators.required],
      Breed: [''],
      DateOfBirth: [''],
      Color: [''],
      Gender: ['', Validators.required],
      IsMicrochip: [null, Validators.required],
      IsNeutered: [null, Validators.required],
    });
  }

  savePet() {
    if (this.petForm.invalid) {
      this.petForm.markAllAsTouched();
      return;
    }
    const v = this.petForm.value;
  }
}
