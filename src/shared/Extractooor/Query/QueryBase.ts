import { WalletAddressRenderCell, AddressRenderCell, ExportAmountFormatter, AmountRenderCell, TransactionRenderCell } from "@/shared/Utils/DataGrid";
import { Operator, QueryBuilder } from "@/shared/Utils/QueryBuilder";
import { ApolloClient, DocumentNode, NormalizedCacheObject, OperationVariables, TypedDocumentNode } from "@apollo/client";
import { getGridDateOperators, getGridNumericOperators, getGridSingleSelectOperators, getGridStringOperators, GridColDef, GridRowsProp } from "@mui/x-data-grid-pro";
import { ExtractooorQuery } from "../Extractooor.type";
import { BaseEntity, BatchQueryResponse } from "@/shared/UniswapV3Subgraph/UniswapV3Subgraph.type";
import { TokenService } from "@/shared/Currency/TokenService";

type Column = GridColDef & {
  filterParser?: (value: string|string[]) => string | number;
};

function parseStringFilter(value: string|string[]) {
  if (typeof value === 'string') {
    return `"${value}"`;
  } else {
    return `[${value.map((v) => `"${v}"`).join(",")}]`;
  }
}
function parseNumberFilter(value: string | string[]) {
  if (typeof value === 'string') {
    return Number(value);
  } else {
    return `[${value.join(",")}]`;
  }
}

function parseIntegerFilter(value: string | string[]) {
  if (typeof value === 'string') {
    return Math.floor(Number(value));
  } else {
    return `[${value.map((v) => Math.floor(Number(v))).join(',')}]`;
  }
}

function parseTimestampFilter(value: string | string[]) {
  if (typeof value === 'string') {
    return Math.floor(new Date(value).getTime() / 1000);
  } else {
    return `[${value.map((v) => Math.floor(new Date(v).getTime() / 1000)).join(',')}]`;
  }
}

/**
 * Max subgraph query size
 */
const MAX_QUERY_PAGE_SIZE = 1000;
const DEFAULT_FILTER_PARSER = parseStringFilter;

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

  protected readonly baseFields = {
    id: {
      filterOperators: getGridStringOperators().filter((operator) =>
        ['equals'].includes(operator.value)
      ),
      filterParser: parseStringFilter,
    },
    addressId: {
      filterOperators: getGridStringOperators().filter((operator) =>
        ['equals'].includes(operator.value)
      ),
      filterParser: parseStringFilter,
      renderCell: AddressRenderCell,
      width: 150,
    },
    transactionId: {
      filterOperators: getGridStringOperators().filter((operator) =>
        ['equals'].includes(operator.value)
      ),
      filterParser: parseStringFilter,
      renderCell: TransactionRenderCell,
      width: 150,
    },
    token: {
      type: 'singleSelect',
      valueOptions: this.tokenService.getAll().map((token) => ({
        label: `${token.symbol} (${token.id})`,
        value: token.id,
      })),
      filterOperators: getGridSingleSelectOperators().filter((operator) =>
        ['isAnyOf'].includes(operator.value)
      ),
      renderCell: AddressRenderCell,
      width: 150,
    },
    amount: {
      type: 'number',
      filterOperators: getGridNumericOperators().filter((operator) =>
        ['=', '<=', '<', '>=', '>'].includes(operator.value)
      ),
      valueFormatter: ExportAmountFormatter,
      renderCell: AmountRenderCell,
      filterParser: parseNumberFilter,
      width: 250,
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
        ['equals', 'startsWith', 'endsWith', 'contains', 'isAnyOf'].includes(
          operator.value
        )
      ),
      filterParser: parseStringFilter,
    },
    walletAddress: {
      filterOperators: getGridStringOperators().filter((operator) =>
        ['equals', 'startsWith', 'endsWith', 'contains', 'isAnyOf'].includes(
          operator.value
        )
      ),
      renderCell: WalletAddressRenderCell,
      width: 200,
    },
    address: {
      filterOperators: getGridStringOperators().filter((operator) =>
        ['equals', 'startsWith', 'endsWith', 'contains', 'isAnyOf'].includes(
          operator.value
        )
      ),
      renderCell: AddressRenderCell,
      width: 150,
    },
    transaction: {
      filterOperators: getGridStringOperators().filter((operator) =>
        ['equals', 'startsWith', 'endsWith', 'contains', 'isAnyOf'].includes(
          operator.value
        )
      ),
      renderCell: TransactionRenderCell,
      width: 150,
    },
    timestamp: {
      type: 'dateTime',
      filterOperators: getGridDateOperators(true).filter((operator) =>
        ['is', 'after', 'onOrAfter', 'before', 'onOrBefore'].includes(
          operator.value
        )
      ),
      filterParser: parseTimestampFilter,
      width: 200,
    },
  };

  constructor(
    readonly title: string,
    readonly description: string,
    readonly apolloClient: ApolloClient<NormalizedCacheObject>,
    readonly tokenService: TokenService
  ) {
    this.reset();
  }

  private async fetchInternal(): Promise<{
    rows: GridRowsProp;
    columns: GridColDef[];
  }> {
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
          throw e;
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

  addFilter(field: string, operator: Operator, value: string | string[]) {
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

  getSubgraphQuery() {
    return this.queryBuilder.build();
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
