export class HttpErrorResponseDto {
  statusCode: number;
  error: string;
  message: string;
}

export class ValidationIssueResponseDto {
  field?: string;
  message: string;
}

export class ValidationErrorResponseDto {
  statusCode: number;
  error: string;
  message: ValidationIssueResponseDto[];
}
