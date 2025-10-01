import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { PersonService } from '../Services/person-service';
import { PersonDto } from '../domain/client';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';
import { StringUtils } from '../Services/string-utils';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { RouteParamService } from '../Services/Utils/route-param-service';

@Component({
  selector: 'app-persons',
  imports: [ReactiveFormsModule, DialogModule],
  templateUrl: './persons.html',
  standalone: true,
  styleUrls: ['./persons.css'],
})
export class Persons implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private personService = inject(PersonService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private routeParamService = inject(RouteParamService);
  private destroy$ = new Subject<void>();

  personId = signal<number>(0);
  person = signal<PersonDto | null>(null);
  isEditing = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  personForm!: FormGroup;

  ngOnInit() {
    this.initializeForm();  

    const personId = this.routeParamService.getIdParam(this.route);
      if (personId !== null) {
        this.personId.set(personId);
        this.isEditing.set(true);
        this.loadPerson(Number(personId));
      }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    this.personForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
    });
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
          this.error.set('Failed to load person details');
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

    const formValue = this.personForm.value;
    
    const person = new PersonDto({
      id: this.isEditing() ? Number(this.personId()) : undefined,
      firstName: StringUtils.capitalizeFirst(formValue.firstName),
      lastName: StringUtils.capitalizeFirst(formValue.lastName),
      address: StringUtils.capitalizeFirst(formValue.address),
      city: StringUtils.capitalizeFirst(formValue.city),
      phoneNumber: formValue.phoneNumber,
      email: formValue.email,
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
        next: () => {
          this.isLoading.set(false);
          this.personForm.reset();
        },
        error: () => {
          this.isLoading.set(false);
          this.error.set('Kunde inte spara person. Försök igen.');
        },
      });
  }

  updatePerson(person: PersonDto) {
    if (!this.personId()) return;

    const personIdNum = Number(this.personId());
    this.isLoading.set(true);

    this.personService
      .updatePerson(personIdNum, person)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/person-details', personIdNum]);
        },
        error: () => {
          this.isLoading.set(false);
          this.error.set('Kunde inte uppdatera person. Försök igen.');
        },
      });
  }

}
