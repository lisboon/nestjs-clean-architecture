import { SearchParams } from '../search-params';
import { expect, it, describe } from '@jest/globals';

describe('SearchParams', () => {
  describe('page', () => {
    it('defaults to 1 when omitted', () => {
      expect(new SearchParams().page).toBe(1);
    });

    it.each([
      [0, 1],
      [-5, 1],
      [NaN, 1],
      [1.5, 1],
      ['abc' as any, 1],
      [null as any, 1],
      [2, 2],
      [100, 100],
    ])('normalizes page=%p to %p', (input, expected) => {
      expect(new SearchParams({ page: input as number }).page).toBe(expected);
    });
  });

  describe('perPage', () => {
    it('defaults to 20 when omitted', () => {
      expect(new SearchParams().perPage).toBe(20);
    });

    it.each([
      [0, 20],
      [-1, 20],
      [NaN, 20],
      [1.5, 20],
      [10, 10],
      [100, 100],
      [500, 100],
    ])('normalizes perPage=%p to %p', (input, expected) => {
      expect(new SearchParams({ perPage: input }).perPage).toBe(expected);
    });
  });

  describe('sort', () => {
    it('defaults to null', () => {
      const params = new SearchParams();
      expect(params.sort).toBeNull();
      expect(params.sortDir).toBeNull();
    });

    it('defaults sortDir to asc when sort is set', () => {
      expect(new SearchParams({ sort: 'name' }).sortDir).toBe('asc');
    });

    it('accepts explicit sortDir', () => {
      expect(new SearchParams({ sort: 'name', sortDir: 'desc' }).sortDir).toBe('desc');
    });

    it('ignores sortDir when sort is null', () => {
      expect(new SearchParams({ sortDir: 'desc' }).sortDir).toBeNull();
    });
  });

  describe('filter', () => {
    it('defaults to null', () => {
      expect(new SearchParams().filter).toBeNull();
    });

    it('accepts a custom filter', () => {
      expect(new SearchParams({ filter: 'active' }).filter).toBe('active');
    });
  });
});
