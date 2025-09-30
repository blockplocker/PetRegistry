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

@Component({
  selector: 'app-pets',

  imports: [CommonModule, ReactiveFormsModule, DialogModule, FormsModule],
  templateUrl: './pets.html',
  styleUrl: './pets.css',
  standalone: true,
})
export class Pets {
  private route = inject(ActivatedRoute);
  personId = Number(this.route.snapshot.paramMap.get('personId'));

  today = new Date().toISOString().substring(0, 10);

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
      personId: [this.personId, Validators.required],
    });
  }

  savePet() {
    if (this.petForm.invalid) return;

    const v = this.petForm.getRawValue();

    const dto: PetDto = {
      ...v,
      Name: StringUtils.capitalizeFirst(v.Name),
      Species: StringUtils.capitalizeFirst(v.Species),
      Breed: StringUtils.capitalizeFirst(v.Breed),
      Color: StringUtils.capitalizeFirst(v.Color),
    };
    this.petService.savePet(dto).subscribe({
      next: () => {
        this.dialog.open(AppDialogComponent, {
          data: { title: 'Sparat!', message: 'Djuret har sparats!' },
        });
        this.petForm.reset({ personId: this.personId });
      },
      error: () => {
        this.dialog.open(AppDialogComponent, {
          data: { title: 'Fel vid sparning', message: 'Kunde inte spara djur' },
        });
      },
    });
  }
}
