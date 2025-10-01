import { Component, inject } from '@angular/core';
import { PetService } from '../Services/pet-service';
import { StringUtils } from '../Services/string-utils';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { AppDialogComponent } from '../components/Dialog/Dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PetDto } from '../domain/client';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

const todayStr = new Date().toISOString().split('T')[0];

@Component({
  selector: 'app-pets',

  imports: [CommonModule, ReactiveFormsModule, DialogModule, FormsModule],
  templateUrl: './pets.html',
  styleUrl: './pets.css',
  standalone: true,
})
export class Pets {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  personId = Number(this.route.snapshot.paramMap.get('id'));

  today = new Date().toISOString().substring(0, 10);

  petForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private petService: PetService,
    private dialog: Dialog,
    private toastr: ToastrService
  ) {
    this.petForm = this.fb.group({
      name: ['', Validators.required],
      species: ['', Validators.required],
      breed: [''],
      dateOfBirth: [''],
      color: [''],
      gender: ['Female', Validators.required],
      isMicrochip: [false, Validators.required],
      isNeutered: [false, Validators.required],
      personId: [this.personId, Validators.required],
    });
  }

  savePet() {
    if (this.petForm.invalid) return;

    const v = this.petForm.getRawValue();

    const dto: PetDto = {
      ...v,
      name: v.name,
      gender: v.gender,
      species: v.species,
      breed: v.breed || null,
      dateOfBirth: v.dateOfBirth.toString() || null,
      color: v.color || null,
      isMicrochip: v.isMicrochip === true,
      isNeutered: v.isNeutered === true,
      registrationDate: new Date(todayStr),
      personId: this.personId,
    };
    this.petService.savePet(dto).subscribe({
      // next: () => {
      //   this.dialog.open(AppDialogComponent, {
      //     data: { title: 'Sparat!', message: 'Djuret har sparats!' },
      //   });
      //   this.petForm.reset({ personId: this.personId });
      // },
      // error: () => {
      //   this.dialog.open(AppDialogComponent, {
      //     data: { title: 'Fel vid sparning', message: 'Kunde inte spara djur' },
      //   });
      next: () => {
        this.toastr.success('Sparat!', 'Djuret har sparats!');
        this.router.navigate(['/search']);
      },
      error: () => {
        this.toastr.error('Fel vid sparning. Försök igen senare.', 'Fel');
      },
    });
  }
}
