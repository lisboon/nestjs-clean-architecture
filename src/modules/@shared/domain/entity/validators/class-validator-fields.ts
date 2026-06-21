import { validateSync } from 'class-validator';
import { IValidatorFields } from './validator-fields-interface';
import { Notification } from './notification';

export abstract class ClassValidatorFields implements IValidatorFields {
  validate(notification: Notification, entityData: unknown, validationGroups: string[]): boolean {
    const errors = validateSync(entityData as object, {
      groups: validationGroups,
    });

    if (errors.length) {
      for (const error of errors) {
        const fieldName = error.property;

        if (error.children?.length) {
          for (const childError of error.children) {
            Object.values(childError.constraints!).forEach((errorMessage) => {
              notification.addError(errorMessage, fieldName);
            });
          }
        }

        if (error.constraints) {
          Object.values(error.constraints).forEach((errorMessage) => {
            notification.addError(errorMessage, fieldName);
          });
        }
      }
    }

    return !errors.length;
  }
}
