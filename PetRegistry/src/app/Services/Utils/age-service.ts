import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AgeService {
  
    calculateAge(birthDate: string): number {
    if (!birthDate) return 0;

    try {
      const birth = new Date(birthDate);
      if (isNaN(birth.getTime())) return 0;

      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return Math.max(0, age);
    } catch {
      return 0;
    }
  }
}
