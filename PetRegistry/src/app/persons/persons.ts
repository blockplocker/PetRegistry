import { Component } from '@angular/core';
import { PersonService } from '../Services/person-service';
import { PersonDto } from '../domain/client';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { AppDialogComponent } from '../components/Dialog/Dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';

@Component({
  selector: 'app-persons',
  imports: [ReactiveFormsModule, DialogModule],
  templateUrl: './persons.html',
  standalone: true,
  styleUrls: ['./persons.css'],
})
export class Persons {
  personForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private personService: PersonService,
    private dialog: Dialog
  ) {
    this.personForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  save() {
    if (this.personForm.valid) {
      const dto = this.personForm.value as PersonDto;

      this.personService.savePerson(dto).subscribe({
        next: (res) => {
          this.dialog.open(AppDialogComponent, {
            data: { title: 'Sparat!', message: 'Personen har sparats!' },
          });

          this.personForm.reset();
        },
        error: (err) => {
          this.dialog.open(AppDialogComponent, {
            data: { title: 'Fel vid sparning', message: 'Kunde inte spara person' },
          });
        },
      });
    }
  }
}
