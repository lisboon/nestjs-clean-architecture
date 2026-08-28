import { Prisma } from "@prisma/client";

type ErrorRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is ErrorRecord =>
  typeof value === "object" && value !== null;

const getDriverCause = (error: unknown): ErrorRecord | undefined => {
  if (!isRecord(error)) return undefined;

  if (error.name === "DriverAdapterError" && isRecord(error.cause)) {
    return error.cause;
  }

  const meta = isRecord(error.meta) ? error.meta : undefined;
  const driverError =
    meta && isRecord(meta.driverAdapterError)
      ? meta.driverAdapterError
      : undefined;
  return driverError && isRecord(driverError.cause)
    ? driverError.cause
    : undefined;
};

export const isTransactionWriteConflict = (error: unknown): boolean =>
  (error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034") ||
  getDriverCause(error)?.kind === "TransactionWriteConflict";

export const isUniqueConstraintViolation = (
  error: unknown,
  field: string,
): boolean => {
  if (!(
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )) {
    return false;
  }

  const target = error.meta?.target;
  if (Array.isArray(target)) return target.includes(field);
  if (typeof target === "string") return target.includes(field);

  const constraint = getDriverCause(error)?.constraint;
  if (!isRecord(constraint)) return false;
  if (Array.isArray(constraint.fields)) {
    return constraint.fields.includes(field);
  }
  return (
    typeof constraint.index === "string" && constraint.index.includes(field)
  );
};
