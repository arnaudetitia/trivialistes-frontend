import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function mancheValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    const isComplete = Array.isArray(value) && value.length === 2 && value.every((v) => v > 0);

    return isComplete ? null : { mancheIncomplete: true };
  };
}
