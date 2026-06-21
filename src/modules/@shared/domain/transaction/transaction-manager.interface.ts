export type TransactionContext = unknown;

export type TransactionIsolationLevel =
  | 'ReadUncommitted'
  | 'ReadCommitted'
  | 'RepeatableRead'
  | 'Serializable';

export interface TransactionOptions {
  isolationLevel?: TransactionIsolationLevel;
}

export interface TransactionManager {
  execute<T>(fn: (trx: TransactionContext) => Promise<T>, options?: TransactionOptions): Promise<T>;
}
