import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AgeService {
  calculateAge(birthDate: string | null | undefined): number {
    if (!birthDate?.trim()) {
      return 0;
    }
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      return 0;
    }

    const today = new Date();
    if (birth > today) {
      return 0;
    }

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return Math.max(0, age);
  }
}
