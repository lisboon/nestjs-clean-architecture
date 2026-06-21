import { UserGateway } from "../../gateway/user.gateway";
import { UserFilter } from "../../gateway/user.filter";
import { SearchParams } from "@/modules/@shared/repository/search-params";
import {
  FindAllUsersUseCaseInputDto,
  FindAllUsersUseCaseInterface,
  FindAllUsersUseCaseOutputDto,
} from "./find-all.usecase.dto";

export default class FindAllUsersUseCase implements FindAllUsersUseCaseInterface {
  constructor(private readonly userGateway: UserGateway) {}

  async execute(
    data: FindAllUsersUseCaseInputDto,
  ): Promise<FindAllUsersUseCaseOutputDto> {
    const filter: UserFilter = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.role !== undefined && { role: data.role }),
      ...(data.active !== undefined && { active: data.active }),
    };

    const result = await this.userGateway.search(
      new SearchParams<UserFilter>({
        page: data.page,
        perPage: data.perPage,
        sort: data.sort,
        sortDir: data.sortDir,
        filter,
      }),
    );

    return {
      items: result.items.map((user) => user.toJSON()),
      total: result.total,
      currentPage: result.currentPage,
      perPage: result.perPage,
      lastPage: result.lastPage,
    };
  }
}
