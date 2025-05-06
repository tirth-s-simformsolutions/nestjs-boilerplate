import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { VALIDATION_MSG } from '../../common/messages';

export function IsUniqueArray(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUniqueArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (!Array.isArray(value)) {
            return false;
          }
          const uniqueValues = new Set(value);
          return uniqueValues.size === value.length;
        },
        defaultMessage(args: ValidationArguments) {
          return VALIDATION_MSG.IS_UNIQUE_ARRAY(args.property);
        },
      },
    });
  };
}
