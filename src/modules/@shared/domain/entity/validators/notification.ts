export class Notification {
  private fieldErrors = new Map<string, string[]>();
  private globalErrors = new Set<string>();

  addError(error: string, field?: string): void {
    if (field) {
      const current = this.fieldErrors.get(field) ?? [];
      if (!current.includes(error)) current.push(error);
      this.fieldErrors.set(field, current);
      return;
    }
    this.globalErrors.add(error);
  }

  setError(error: string | string[], field?: string): void {
    const errors = Array.isArray(error) ? error : [error];
    if (field) {
      this.fieldErrors.set(field, [...errors]);
      return;
    }
    errors.forEach((e) => this.globalErrors.add(e));
  }

  hasErrors(): boolean {
    return this.fieldErrors.size > 0 || this.globalErrors.size > 0;
  }

  copyErrors(notification: Notification): void {
    notification.fieldErrors.forEach((messages, field) => {
      messages.forEach((m) => this.addError(m, field));
    });
    notification.globalErrors.forEach((m) => this.addError(m));
  }

  toJSON(): ValidationError[] {
    const result: ValidationError[] = [];
    this.globalErrors.forEach((message) =>
      result.push({ field: null, message }),
    );
    this.fieldErrors.forEach((messages, field) => {
      messages.forEach((message) => result.push({ field, message }));
    });
    return result;
  }
}

export interface ValidationError {
  field: string | null;
  message: string;
}
