import { v4 as uuidv4 } from 'uuid';

export interface IdGenerator {
  generate(): string;
}

export class UuidIdGenerator implements IdGenerator {
  generate(): string {
    return uuidv4();
  }
}

export const defaultIdGenerator: IdGenerator = new UuidIdGenerator();
