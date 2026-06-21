import { User } from "../domain/user.entity";
import { UserFilter } from "./user.filter";
import { SearchParams } from "@/modules/@shared/repository/search-params";
import { SearchResult } from "@/modules/@shared/repository/search-result";
import { TransactionContext } from "@/modules/@shared/domain/transaction/transaction-manager.interface";

export interface UserGateway {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  search(params: SearchParams<UserFilter>): Promise<SearchResult<User>>;
  countActiveAdmins(trx?: TransactionContext): Promise<number>;
  create(user: User, trx?: TransactionContext): Promise<void>;
  update(user: User, trx?: TransactionContext): Promise<void>;
}
