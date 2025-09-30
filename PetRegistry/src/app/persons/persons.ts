import { Component } from '@angular/core';
import { PersonService } from '../Services/person-service';
import { PersonDto } from '../domain/client';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { AppDialogComponent } from '../components/Dialog/Dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';
import { StringUtils } from '../Services/string-utils';

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
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  savePerson() {
    if (this.personForm.invalid) return;

    const v = this.personForm.getRawValue();

    const dto: PersonDto = {
      ...v,
      firstName: StringUtils.capitalizeFirst(v.firstName),
      lastName: StringUtils.capitalizeFirst(v.lastName),
      city: StringUtils.capitalizeFirst(v.city),
      address: StringUtils.capitalizeFirst(v.address),
    };

    this.personService.savePerson(dto).subscribe({
      next: () => {
        this.dialog.open(AppDialogComponent, {
          data: { title: 'Sparat!', message: 'Personen har sparats!' },
        });
        this.personForm.reset();
      },
      error: () => {
        this.dialog.open(AppDialogComponent, {
          data: { title: 'Fel vid sparning', message: 'Kunde inte spara person' },
        });
      },
    });
  }
}
