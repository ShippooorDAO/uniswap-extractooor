import { DocumentNode } from "graphql";
import { gql } from '@apollo/client';

export interface Filter {
  field: string;
  operator: Operator;
  value: string | number;
}

export enum Operator {
  EQ = '',
  LT = '_lt',
  LTE = '_lte',
  GT = '_gt',
  GTE = '_gte',

  STARTS_WITH = '_starts_with',
  ENDS_WITH = '_ends_with',
  CONTAINS = '_contains',
}

export class QueryBuilder {
  private body?: string;
  private entityName?: string;
  private filters: Map<string, Filter> = new Map();
  private orderBy?: string;
  private orderDirection?: string;
  private page: number = 0;
  private pageSize: number = 1000;

  constructor() {}

  setBody(body: string) {
    this.body = body;
    return this;
  }

  setEntityName(entityName: string) {
    this.entityName = entityName;
    return this;
  }

  addFilter(
    field: string,
    operator: Operator,
    value: string | number
  ) {
    this.filters.set(field, { field, operator, value });
    return this;
  }

  removeFilter(field: string) {
    this.filters.delete(field);
    return this;
  }

  clearFilters() {
    this.filters.clear();
  }

  setOrderBy(orderBy: string) {
    this.orderBy = orderBy;
    return this;
  }

  setOrderDirection(orderDirection: 'asc' | 'desc') {
    this.orderDirection = orderDirection;
    return this;
  }

  setPage(page: number) {
    this.page = page;
    return this;
  }

  setPageSize(pageSize: number) {
    this.pageSize = pageSize;
    return this;
  }

  build(): DocumentNode {
    if (!this.body) {
      throw 'Query cannot be built. Body must be set using `setBody` method.';
    }

    if (!this.entityName) {
      throw 'Query cannot be built. Entity name must be set using `setEntityName` method.';
    }

    const where = this.buildWhereStatement();
    const skip = this.buildSkipStatement();
    const first = this.buildFirstStatement();
    const orderBy = this.buildSortByStatement();
    const orderDirection = this.buildSortDirectionStatement();

    const statements = [where, skip, first, orderBy, orderDirection].join(', ');

    return gql`
        query queryName {
            ${this.entityName} (${statements}) 
                ${this.body}
        }
    `;
  }

  buildBatchQuery(): DocumentNode {
    if (!this.body) {
      throw 'Query cannot be built. Body must be set using `setBody` method.';
    }

    if (!this.entityName) {
      throw 'Query cannot be built. Entity name must be set using `setEntityName` method.';
    }

    const forcedFilters = new Map([
      ['id', { field: 'id', operator: Operator.GT, value: '$lastID' }],
    ]);

    const where = this.buildWhereStatement(forcedFilters);

    return gql`
      query batchQuery($pageSize: Int!, $lastID: String) {
        batch: ${this.entityName}(
          first: $pageSize,
          orderBy: id,
          orderDirection: asc,
          ${where} 
        ) ${this.body}
      }
    `;
  }

  private buildFilter(filter: Filter) {
    return `${filter.field}${filter.operator}: ${filter.value}`;
  }

  private buildWhereStatement(
    forcedFilters: Map<string, Filter> = new Map()
  ): string | null {
    const mergedFilters = new Map([
      ...Array.from(this.filters.entries()),
      ...Array.from(forcedFilters.entries()),
    ]);

    if (mergedFilters.size === 0) {
      return null;
    }

    const serializedFilters = Array.from(mergedFilters.values()).map(
      (filter: Filter) => this.buildFilter(filter)
    );

    return `where: {${serializedFilters.join(', ')}}`;
  }

  private buildSkipStatement(): string | null {
    const skip = this.pageSize * this.page;
    return `skip: ${skip}`;
  }

  private buildFirstStatement(): string | null {
    return `first: ${this.pageSize}`;
  }

  private buildSortByStatement(): string | null {
    if (!this.orderBy) {
      return null;
    }
    return `orderBy: ${this.orderBy}`;
  }

  private buildSortDirectionStatement(): string | null {
    if (!this.orderDirection) {
      return null;
    }
    return `orderDirection: ${this.orderDirection}`;
  }
}