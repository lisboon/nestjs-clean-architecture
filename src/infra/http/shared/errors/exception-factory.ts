import { UnprocessableEntityException } from '@nestjs/common';
import { ValidationError as ClassValidatorError } from 'class-validator';
import { ValidationError } from '@/modules/@shared/domain/entity/validators/notification';

function flatten(err: ClassValidatorError, parentPath: string | null): ValidationError[] {
  const path = parentPath ? `${parentPath}.${err.property}` : err.property;
  const out: ValidationError[] = [];

  if (err.constraints) {
    for (const message of Object.values(err.constraints)) {
      out.push({ field: path, message });
    }
  }

  if (err.children?.length) {
    for (const child of err.children) {
      out.push(...flatten(child, path));
    }
  }

  return out;
}

export default function exceptionFactory(errors: ClassValidatorError[]) {
  const flat = errors.flatMap((err) => flatten(err, null));
  return new UnprocessableEntityException(flat);
}
