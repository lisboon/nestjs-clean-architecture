export class ApiInfoResponseDto {
  name: string;
  description: string;
  version: string;
}

export const API_INFO: ApiInfoResponseDto = {
  name: "NestJS Clean Architecture API",
  description: "DDD and Clean Architecture backend template",
  version: "1.0.0",
};
