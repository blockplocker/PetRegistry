import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { PetService } from '../Services/pet-service';
import { PetDto } from '../domain/client';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { AgeService } from '../Services/Utils/age-service';
import { DatePipe } from '@angular/common';
import { RouteParamService } from '../Services/Utils/route-param-service';
import { ToastrService } from 'ngx-toastr';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmDialogComponent } from '../components/Dialog/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-pet-details',
  imports: [RouterLink, DatePipe],
  templateUrl: './pet-details.html',
  styleUrl: './pet-details.css',
})
export class PetDetails implements OnInit, OnDestroy {
  private ageService = inject(AgeService);
  private petService = inject(PetService);
  private dialog = inject(Dialog);
  private toastr = inject(ToastrService);
  private routeParamService = inject(RouteParamService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  petId = signal(0);
  pet = signal<PetDto | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.isLoading.set(true);
    const petId = this.routeParamService.getIdParam(this.activatedRoute);

    if (petId !== null) {
      this.petId.set(petId);
      this.loadPetDetails();
    } else {
      this.error.set('Invalid pet ID.');
      this.isLoading.set(false);
    }
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  loadPetDetails() {
    this.isLoading.set(true);
    this.error.set(null);

    this.petService
      .getPetById(this.petId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
  deletePet() {
    const pet = this.pet();

    if (!pet) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete ${pet.name}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });
    ref.closed.subscribe((confirmed) => {
      if (confirmed) {
        this.performDelete(this.petId());
      }
    });
  }

  private performDelete(petId: number) {
    this.isLoading.set(true);

    this.petService
      .deletePet(petId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toastr.success('Husdjur har raderats', 'Raderad!');
          this.router.navigate(['/search']);
        },
        error: () => {
          this.isLoading.set(false);
          this.toastr.error('Kunde inte radera husdjur. Försök igen senare.', 'Fel');
        },
      });
  }
}
