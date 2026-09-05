import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { assertPublicHttpUrl } from '../../lib/public-url.js';

@ValidatorConstraint({ name: 'isPublicHttpUrl', async: false })
export class IsPublicHttpUrlConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value !== 'string') return false;
    return assertPublicHttpUrl(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a public http(s) URL (no localhost or private hosts)`;
  }
}

export function IsPublicHttpUrl(options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsPublicHttpUrlConstraint,
    });
  };
}
