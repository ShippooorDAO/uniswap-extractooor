import { AmountFormatter } from "@/shared/Utils/DataGrid";
import { batchQuery } from '@/shared/Utils/Subgraph';
import { Operator, QueryBuilder } from "@/shared/Utils/QueryBuilder";
import { ApolloClient, DocumentNode, NormalizedCacheObject, OperationVariables, TypedDocumentNode } from "@apollo/client";
import { getGridDateOperators, getGridNumericOperators, getGridStringOperators, GridColDef, GridRowsProp } from "@mui/x-data-grid-pro";
import { ExtractooorQuery } from "../Extractooor.type";
import { BaseEntity, BatchQueryResponse } from "@/shared/UniswapV3Subgraph/UniswapV3Subgraph.type";

type Column = GridColDef & {
  filterParser?: (value: string) => string | number;
};

function parseStringFilter(value: string) {
  return `"${value}"`;
}
function parseNumberFilter(value: string) {
  return Number(value);
}

function parseIntegerFilter(value: string) {
  return Math.floor(Number(value));
}

function parseTimestampFilter(value: string) {
  return Math.floor(new Date(value).getTime() / 1000);
}

export const baseFields = {
  id: {
    filterOperators: getGridStringOperators().filter((operator) =>
      ['equals'].includes(operator.value)
    ),
    filterParser: parseStringFilter,
  },
  amount: {
    type: 'number',
    filterOperators: getGridNumericOperators().filter((operator) =>
      ['=', '<=', '<', '>=', '>'].includes(operator.value)
    ),
    valueFormatter: AmountFormatter,
    filterParser: parseNumberFilter,
  },
  integer: {
    type: 'number',
    filterOperators: getGridNumericOperators().filter((operator) =>
      ['=', '<=', '<', '>=', '>'].includes(operator.value)
    ),
    filterParser: parseIntegerFilter,
  },
  string: {
    filterOperators: getGridStringOperators().filter((operator) =>
      ['equals', 'startsWith', 'endsWith', 'contains'].includes(operator.value)
    ),
    filterParser: parseStringFilter,
  },
  timestamp: {
    type: 'dateTime',
    filterOperators: getGridDateOperators().filter((operator) =>
      ['is', 'after', 'onOrAfter', 'before', 'onOrBefore'].includes(
        operator.value
      )
    ),
    filterParser: parseTimestampFilter,
  },
};

/**
 * Max subgraph query size
 */
const MAX_QUERY_PAGE_SIZE = 1000;
const DEFAULT_FILTER_PARSER = (value: string) => value;

export abstract class ExtractooorQueryBase<
  TResponse,
  TResponseEntity extends { id: string }
> implements ExtractooorQuery
{
  private queryBuilder = new QueryBuilder();
  private pageSize: number = MAX_QUERY_PAGE_SIZE;
  private cancelCount = 0;
  private currentFetchPromise?: Promise<{
    rows: GridRowsProp;
    columns: GridColDef[];
  }>;

  constructor(
    readonly title: string,
    readonly description: string,
    readonly apolloClient: ApolloClient<NormalizedCacheObject>
  ) {
    this.reset();
  }

  private async fetchInternal(): Promise<{ rows: GridRowsProp; columns: GridColDef[] }> {
    const maxAttempts = 10;
    const startCancelCount = Number(this.cancelCount);

    let attempt = 0;
    while (attempt < maxAttempts && this.cancelCount === startCancelCount) {
      try {
        const response = await this.apolloClient.query<TResponse>({
          query: this.queryBuilder.build(),
        });
        const rows = this.getRows(
          (response.data as unknown as any)[this.getQueryEntityName()]
        );
        const columns = this.getColumns();
        return { rows, columns };
      } catch (e: unknown) {
        attempt += 1;
        if (attempt === maxAttempts) {
          throw (
            'Max number of fetch attempts reached caused by subgraph failure: ' +
            e
          );
        }
      }
    }

    return { rows: [], columns: [] };
  }

  async fetch(): Promise<{ rows: GridRowsProp; columns: GridColDef[] }> {
    if (this.currentFetchPromise) {
      await this.currentFetchPromise;
    }
    const promise = this.fetchInternal();
    this.currentFetchPromise = promise;
    return promise;
  }

  async batchQuery<TData extends BaseEntity, TVariables = OperationVariables>(
    query: DocumentNode | TypedDocumentNode<TData, TVariables>,
    apolloClient: ApolloClient<NormalizedCacheObject>,
    variables?: TVariables,
    pageSize = 1000
  ): Promise<TData[]> {
    let hasMoreResults = false;
    let lastID = '0';
    const startCancelCount = Number(this.cancelCount);
    const batchResult: TData[] = [];

    do {
      try {
        const results = await apolloClient.query<BatchQueryResponse<TData>>({
          query,
          variables: {
            ...variables,
            pageSize,
            lastID,
          },
        });
        const dataList: TData[] = results.data.batch ?? [];
        batchResult.push(...dataList);

        hasMoreResults = dataList.length > 0;
        if (hasMoreResults) {
          lastID = dataList.at(-1)!.id;
        }
      } catch (e: unknown) {
        continue;
      }
    } while (hasMoreResults && this.cancelCount === startCancelCount);

    return batchResult;
  }

  private async fetchAllInternal(): Promise<{
    rows: GridRowsProp;
    columns: GridColDef[];
  }> {
    const query = this.queryBuilder.buildBatchQuery();
    const data = await this.batchQuery<TResponseEntity>(
      query,
      this.apolloClient
    );
    const rows = this.getRows(data);
    const columns = this.getColumns();
    return { rows, columns };
  }

  async fetchAll(): Promise<{ rows: GridRowsProp; columns: GridColDef[] }> {
    if (this.currentFetchPromise) {
      await this.currentFetchPromise;
    }
    const promise = this.fetchAllInternal();
    this.currentFetchPromise = promise;
    return promise;
  }

  addFilter(field: string, operator: Operator, value: string) {
    const filterParser =
      this.getColumns().find((column) => column.field === field)
        ?.filterParser || DEFAULT_FILTER_PARSER;

    this.queryBuilder.addFilter(field, operator, filterParser(value));
  }

  removeFilter(field: string) {
    this.queryBuilder.removeFilter(field);
  }

  clearFilters() {
    this.queryBuilder.clearFilters();
  }

  setPage(page: number) {
    this.queryBuilder.setPage(page);
  }

  setPageSize(pageSize: number) {
    this.queryBuilder.setPageSize(pageSize);
  }

  getPageSize() {
    return this.pageSize;
  }

  setOrderBy(field: string) {
    this.queryBuilder.setOrderBy(field);
  }

  setOrderDirection(orderDirection: 'asc' | 'desc') {
    this.queryBuilder.setOrderDirection(orderDirection);
  }

  reset() {
    this.pageSize = MAX_QUERY_PAGE_SIZE;
    this.queryBuilder = new QueryBuilder()
      .setBody(this.getQueryBody())
      .setEntityName(this.getQueryEntityName())
      .setPageSize(this.pageSize);
  }

  async cancel() {
    if (this.currentFetchPromise) {
      this.cancelCount += 1;
      await this.currentFetchPromise;
    }
  }

  protected abstract getQueryBody(): string;
  protected abstract getQueryEntityName(): string;
  protected abstract getColumns(): Column[];
  protected abstract getRows(data: TResponseEntity[]): GridRowsProp;
}
