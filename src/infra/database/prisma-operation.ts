import { isUniqueConstraintViolation } from "./prisma-error.inspector";

export const executeWithUniqueConstraintTranslation = async <T>(
  operation: () => Promise<T>,
  field: string,
  errorFactory: () => Error,
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (isUniqueConstraintViolation(error, field)) {
      throw errorFactory();
    }
    throw error;
  }
};
