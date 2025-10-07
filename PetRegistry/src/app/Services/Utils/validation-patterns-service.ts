import { Injectable } from '@angular/core';
import { Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class ValidationPatterns {
    constructor(private translateService: TranslateService) { }

    static readonly PATTERNS = {
        // Names: letters (including international), spaces, hyphens, apostrophes
        NAME: /^[a-zA-Z\u00c0-\u00ff\s'-]+$/,

        // Address: alphanumeric, spaces, dots, commas, hyphens
        ADDRESS: /^[a-zA-Z\u00c0-\u00ff0-9\s.,-]+$/,

        // Phone: flexible format with length validation (10-15 digits)
        PHONE: /^[+]?[0-9\s()-]*[0-9][0-9\s()-]*$/,

        // Email: basic email pattern (used alongside Validators.email)
        EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    };

    name(maxLength?: number): ValidatorFn[] {
        const validators = [
            Validators.required,
            this.notEmptyAfterTrimValidator(),
            Validators.pattern(ValidationPatterns.PATTERNS.NAME),
        ];
        if (maxLength) {
            validators.push(Validators.maxLength(maxLength));
        }
        return validators;
    }

    address(maxLength?: number): ValidatorFn[] {
        const validators = [
            Validators.required,
            this.notEmptyAfterTrimValidator(),
            Validators.pattern(ValidationPatterns.PATTERNS.ADDRESS),
        ];
        if (maxLength) {
            validators.push(Validators.maxLength(maxLength));
        }
        return validators;
    }

    phone(minLength: number = 10, maxLength: number = 15): ValidatorFn[] {
        return [
            Validators.required,
            this.notEmptyAfterTrimValidator(),
            Validators.minLength(minLength),
            Validators.maxLength(maxLength),
            Validators.pattern(ValidationPatterns.PATTERNS.PHONE),
        ];
    }

    private notEmptyAfterTrimValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null; // Don't validate null/undefined values, let required handle that
            }
            const trimmedValue = control.value.toString().trim();
            if (trimmedValue.length === 0) {
                return { emptyAfterTrim: true };
            }
            return null;
        };
    }

    email(): ValidatorFn[] {
        return [
            Validators.required,
            this.notEmptyAfterTrimValidator(),
            Validators.email,
            Validators.pattern(ValidationPatterns.PATTERNS.EMAIL),
        ];
    }

    // Optional name field (for breed, color, etc.)
    optionalName(maxLength?: number): ValidatorFn[] {
        const validators = [
            this.notEmptyAfterTrimValidator(),
            Validators.pattern(ValidationPatterns.PATTERNS.NAME),
        ];
        if (maxLength) {
            validators.push(Validators.maxLength(maxLength));
        }
        return validators;
    }

    getValidationErrorMessage(fieldName: string, error: any): string {
        // Define error priority order (what to show first)
        const errorPriority = [
            'required',
            'emptyAfterTrim',
            'minlength',
            'maxlength',
            'email',
            'pattern',
        ];

        const errorType = errorPriority.find((errorKey) => error[errorKey]);

        switch (errorType) {
            case 'required':
                return this.translateService.instant('VALIDATION.FIELD_REQUIRED', { field: fieldName });

            case 'emptyAfterTrim':
                return this.translateService.instant('VALIDATION.FIELD_WHITESPACE_ONLY', {
                    field: fieldName,
                });

            case 'minlength':
                return this.translateService.instant('VALIDATION.FIELD_MIN_LENGTH', {
                    field: fieldName,
                    minLength: error.minlength.requiredLength,
                });

            case 'maxlength':
                return this.translateService.instant('VALIDATION.FIELD_MAX_LENGTH', {
                    field: fieldName,
                    maxLength: error.maxlength.requiredLength,
                });

            case 'email':
                return this.translateService.instant('VALIDATION.EMAIL_INVALID');

            case 'pattern':
                return this.translateService.instant('VALIDATION.FIELD_INVALID_FORMAT', {
                    field: fieldName,
                });

            default:
                return this.translateService.instant('VALIDATION.FIELD_INVALID', { field: fieldName });
        }
    }

    getFieldName(fieldKey: string): string {
        const fieldMapping: Record<string, string> = {
            // Person fields
            firstName: 'PERSONS_FORM.FIRST_NAME',
            lastName: 'PERSONS_FORM.LAST_NAME',
            address: 'PERSONS_FORM.ADDRESS',
            city: 'PERSONS_FORM.CITY',
            phoneNumber: 'PERSONS_FORM.PHONE',
            email: 'PERSONS_FORM.EMAIL',
            // Pet fields
            name: 'PETS_FORM.ANIMAL_NAME',
            species: 'PETS_FORM.SPECIES',
            breed: 'PETS_FORM.BREED',
            color: 'PETS_FORM.COLOR',
            gender: 'PETS_FORM.GENDER',
            isMicrochip: 'PETS_FORM.MICROCHIP_QUESTION',
            isNeutered: 'PETS_FORM.NEUTERED_QUESTION'
        };

        const translationKey = fieldMapping[fieldKey];
        return translationKey ? this.translateService.instant(translationKey) : fieldKey;
    }
}
