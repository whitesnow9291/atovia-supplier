import { FormControl } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export const validateEmail = function(c: FormControl) {
  if (isEmptyInputValue(c.value)) {
    return null;  // don't validate empty values to allow optional controls
  }

  let EMAIL_REGEXP = /^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)[\\.]([a-zA-Z]{2,9})$/;

  return EMAIL_REGEXP.test(c.value) ? null : {
    validateEmail: {
      valid: false
    }
  };
}

export const validatePhoneNum = function(c: FormControl) {
  if (isEmptyInputValue(c.value)) {
    return null;  // don't validate empty values to allow optional controls
  }

  let REGEXP = /^\+?[0-9\(\)\-\.\ ]{7,20}[0-9]{3}$/;

  return REGEXP.test(c.value) ? null : {
    validatePhoneNum: {
      valid: false
    }
  };
}

export const validateFirstName = function(c: FormControl) {
  if (isEmptyInputValue(c.value)) {
    return null;  // don't validate empty values to allow optional controls
  }

  let REGEXP = /^[a-zA-Z\.]{2,}[a-zA-Z ]{0,30}$/;

  return REGEXP.test(c.value) ? null : {
    validateFirstName: {
      valid: false
    }
  };
}

export const validatePassword = function(c: FormControl) {
  if (isEmptyInputValue(c.value)) {
    return null;  // don't validate empty values to allow optional controls
  }

  let REGEXP = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\(\)\-\_\=\+\{\}\[\]\;\:\'\"\,\.\<\>\/\\\|\?])(?=.{8,})/;

  return REGEXP.test(c.value) ? null : {
    validatePassword: {
      valid: false
    }
  };
}

export function matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
  return (group: FormGroup): {[key: string]: any} => {
    let password = group.controls[passwordKey];
    let confirmPassword = group.controls[confirmPasswordKey];

    if (password.value !== confirmPassword.value) {
      return {
        mismatchedPasswords: true
      };
    }
  }
}

export const validateSlug = function(c: FormControl) {
  if (isEmptyInputValue(c.value)) {
    return null;  // don't validate empty values to allow optional controls
  }

  let REGEXP = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;

  return REGEXP.test(c.value) ? null : {
    validateSlug: {
      valid: false
    }
  };
}

export const validateMinVal = (min: number) => {
  return (c: FormControl) => {
    if (isEmptyInputValue(c.value)) {
      return null;  // don't validate empty values to allow optional controls
    }

    let num = +c.value;

    if(isNaN(num) || num < min){
      return {
        validateMinVal: {
          valid: false
        }
      }
    }
    return null;
  }
}

export const validateMaxVal = (max: number) => {
  return (c: FormControl) => {
    if (isEmptyInputValue(c.value)) {
      return null;  // don't validate empty values to allow optional controls
    }

    let num = +c.value;

    if(isNaN(num) || num > max){
      return {
        validateMaxVal: {
          valid: false
        }
      }
    }
    return null;
  }
}

function isEmptyInputValue(value: any) {
  return value == null || typeof value === 'string' && value.length === 0;
}
