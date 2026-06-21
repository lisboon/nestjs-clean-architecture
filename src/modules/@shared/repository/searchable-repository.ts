import BaseEntity from '../domain/entity/base.entity';
import { SearchResult } from './search-result';

export interface SearchableRepository<E extends BaseEntity, Filter> {
  sortableFields: string[];
  search(params: Filter): Promise<SearchResult<E>>;
}
