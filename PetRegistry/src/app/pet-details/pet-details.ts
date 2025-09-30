import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { PetService } from '../Services/pet-service';
import { PetDto } from '../domain/client';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { AgeService } from '../Services/Utils/age-service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-pet-details',
  imports: [RouterLink, DatePipe],
  templateUrl: './pet-details.html',
  styleUrl: './pet-details.css'
})
export class PetDetails implements OnInit, OnDestroy {
  private ageService = inject(AgeService);
  private petService = inject(PetService);
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  readonly petId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');

  pet = signal<PetDto | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadPetDetails();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  loadPetDetails() {
    this.isLoading.set(true);
    this.error.set(null);

    const petIdNum = Number(this.petId());

    this.petService.getPetById(petIdNum).pipe(takeUntil(this.destroy$)).subscribe({
      next: (pet) => {
        this.pet.set(pet);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load pet details. Please try again.');
        this.isLoading.set(false);
      },
    });
  }
  calculateAge(birthDate: string): number {
    return this.ageService.calculateAge(birthDate);
  }
  
}