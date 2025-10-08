import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pet-details',
  imports: [RouterLink, DatePipe, TranslateModule],
  templateUrl: './pet-details.html',
  styleUrl: './pet-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetDetails implements OnInit, OnDestroy {
  private ageService = inject(AgeService);
  private petService = inject(PetService);
  private dialog = inject(Dialog);
  private toastr = inject(ToastrService);
  private routeParamService = inject(RouteParamService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private translateService = inject(TranslateService);
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
      this.translateService
        .get('COMMON.INVALID_ID')
        .pipe(takeUntil(this.destroy$))
        .subscribe((translation) => {
          this.error.set(translation);
          this.isLoading.set(false);
        });
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
        error: () => {
          this.error.set(this.translateService.instant('COMMON.PET_LOAD_DETAILS_ERROR'));
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
        title: this.translateService.instant('COMMON.CONFIRM_DELETION'),
        message: this.translateService.instant('COMMON.DELETE_CONFIRMATION_MESSAGE', {
          name: pet.name,
        }),
        confirmText: this.translateService.instant('COMMON.DELETE'),
        cancelText: this.translateService.instant('COMMON.CANCEL'),
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
          this.toastr.success(
            this.translateService.instant('COMMON.PET_DELETED'),
            this.translateService.instant('COMMON.DELETE_SUCCESS')
          );
          this.router.navigate(['/search']);
        },
        error: () => {
          this.isLoading.set(false);
          this.toastr.error(
            this.translateService.instant('COMMON.PET_DELETE_ERROR'),
            this.translateService.instant('COMMON.DELETE_ERROR')
          );
        },
      });
  }
}
