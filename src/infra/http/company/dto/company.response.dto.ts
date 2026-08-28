export class CompanyResponseDto {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class CompaniesPageResponseDto {
  items: CompanyResponseDto[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

export class DeleteCompanyResponseDto {
  id: string;
  deletedAt: Date;
}
