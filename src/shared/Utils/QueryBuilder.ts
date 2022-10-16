import { DocumentNode } from 'graphql';
import { gql } from '@apollo/client';

export interface Filter {
  field: string;
  operator: Operator;
  value: string | number;
}

export class QuerySizeError extends Error {
  constructor() {
    super(
      "Query body length is more than subgraph request limit of 100'000 characters."
    );
    this.name = 'QuerySizeError';
  }
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

  IN = '_in',
}

export class QueryBuilder {
  private body?: string;
  private entityName?: string;
  private filters = new Map<string, Filter>();
  private orderBy?: string;
  private orderDirection?: string;
  private page: number = 0;
  private pageSize: number = 1000;
  private batchCursorField: string = 'id';
  private firstFetchDone: boolean = false;

  constructor() {}

  setBody(body: string) {
    this.body = body;
    return this;
  }

  setEntityName(entityName: string) {
    this.entityName = entityName;
    return this;
  }

  addFilter(field: string, operator: Operator, value: string | number) {
    const previousFilters: Map<string, Filter> = new Map([
      ...Array.from(this.filters.entries()),
    ]);
    this.filters.set(field, { field, operator, value });

    if (!this.checkQuerySize()) {
      // rollback changes if the query is too big and exceeds the limit.
      this.filters = previousFilters;
      throw new QuerySizeError();
    }

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
    const previousOrderBy = this.orderBy;
    const batchCursorField = this.batchCursorField;

    this.orderBy = orderBy;
    this.batchCursorField = orderBy;

    if (!this.checkQuerySize()) {
      this.orderBy = previousOrderBy;
      this.batchCursorField = batchCursorField;
      throw new QuerySizeError();
    }

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

    const statements = [where, skip, first, orderBy, orderDirection]
      .filter((value) => !!value)
      .join(', ');

    return gql`
        {
            ${this.entityName} (${statements}) 
                ${this.body}
        }
    `;
  }

  setFirstFetchDone(done: boolean) {
    this.firstFetchDone = done;
  }

  buildBatchQuery(): DocumentNode {
    if (!this.body) {
      throw 'Query cannot be built. Body must be set using `setBody` method.';
    }

    if (!this.entityName) {
      throw 'Query cannot be built. Entity name must be set using `setEntityName` method.';
    }

    const forcedFilters = new Map([
      [
        this.batchCursorField,
        {
          field: this.batchCursorField,
          operator: Operator.GT,
          value: '$batchCursor',
        },
      ],
    ]);

    const where = this.firstFetchDone
      ? this.buildWhereStatement(forcedFilters)
      : this.buildWhereStatement();

    const orderByStatement = this.orderBy
      ? `orderBy: ${this.orderBy}`
      : 'orderBy: id';

    const orderDirection = this.orderDirection ?? 'asc';

    const statements: string = [
      'first: $pageSize',
      `${orderByStatement}`,
      `orderDirection: ${orderDirection}`,
      where,
    ]
      .filter((value) => !!value)
      .join(', ');

    return gql`
      query batchQuery($pageSize: Int!, $batchCursor: String) {
        batch: ${this.entityName}(
          ${statements}
        ) ${this.body}
      }
    `;
  }

  getRequestSize() {
    const batchQuery = this.buildBatchQuery();
    return batchQuery.loc?.source.body.length || 0;
  }

  getOrderBy(): string {
    return this.orderBy ?? '';
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

    const serializedFilters = Array.from(mergedFilters.values())
      .filter((filter) => !!filter.field && !!filter.value)
      .map((filter: Filter) => this.buildFilter(filter));

    if (serializedFilters.length === 0) {
      return null;
    }

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

  private checkQuerySize() {
    const querySize = this.getRequestSize();
    return querySize < 100000;
  }
}
