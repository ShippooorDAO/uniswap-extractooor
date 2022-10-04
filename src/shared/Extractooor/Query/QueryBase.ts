import {
  WalletAddressRenderCell,
  AddressRenderCell,
  ExportAmountFormatter,
  AmountRenderCell,
  TransactionRenderCell,
  UniswapTokenRenderCell,
  UniswapPoolRenderCell,
} from '@/shared/Utils/DataGrid';
import { Operator, QueryBuilder } from '@/shared/Utils/QueryBuilder';
import {
  ApolloClient,
  DocumentNode,
  NormalizedCacheObject,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client';
import {
  getGridDateOperators,
  getGridNumericOperators,
  getGridSingleSelectOperators,
  getGridStringOperators,
  GridColDef,
  GridRowsProp,
} from '@mui/x-data-grid-pro';
import { ExtractooorQuery } from '../Extractooor.type';
import {
  BaseEntity,
  BatchQueryResponse,
} from '@/shared/UniswapV3Subgraph/UniswapV3Subgraph.type';
import { TokenService } from '@/shared/Currency/TokenService';

type Column = GridColDef & {
  filterParser?: (value: string | string[]) => string | number;
};

function parseStringFilter(value: string | string[]) {
  if (typeof value === 'string') {
    return `"${value}"`;
  } else {
    return `[${value.map((v) => `"${v}"`).join(',')}]`;
  }
}
function parseNumberFilter(value: string | string[]) {
  if (typeof value === 'string') {
    return Number(value);
  } else {
    return `[${value.join(',')}]`;
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
    return `[${value
      .map((v) => Math.floor(new Date(v).getTime() / 1000))
      .join(',')}]`;
  }
}

/**
 * Max subgraph query size
 */
const MAX_QUERY_PAGE_SIZE = 1000;
const DEFAULT_FILTER_PARSER = parseStringFilter;

export abstract class ExtractooorQueryBase<
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
  private batchCursor: string = '';
  private reachedBatchEnd: boolean = false;
  private orderBy: string = '';

  protected readonly idFilterOperators = getGridStringOperators().filter(
    (operator) => ['equals', 'isAnyOf'].includes(operator.value)
  );

  protected readonly baseFields = {
    id: {
      filterOperators: this.idFilterOperators,
      filterParser: parseStringFilter,
    },
    addressId: {
      filterOperators: this.idFilterOperators,
      filterParser: parseStringFilter,
      renderCell: AddressRenderCell,
      width: 150,
    },
    transactionId: {
      filterOperators: this.idFilterOperators,
      filterParser: parseStringFilter,
      renderCell: TransactionRenderCell,
      width: 150,
    },
    poolId: {
      filterOperators: this.idFilterOperators,
      filterParser: parseStringFilter,
      renderCell: UniswapPoolRenderCell,
      width: 150,
    },
    tokenId: {
      filterOperators: this.idFilterOperators,
      filterParser: parseStringFilter,
      renderCell: UniswapTokenRenderCell,
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
      renderCell: UniswapTokenRenderCell,
      width: 150,
    },
    pool: {
      filterOperators: getGridStringOperators().filter((operator) =>
        ['equals', 'startsWith', 'endsWith', 'contains', 'isAnyOf'].includes(
          operator.value
        )
      ),
      renderCell: UniswapPoolRenderCell,
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

  async fetchNext(): Promise<{ rows: GridRowsProp; columns: GridColDef[] }> {
    if (this.currentFetchPromise) {
      await this.currentFetchPromise;
    }
    const query = this.queryBuilder.buildBatchQuery();
    const promise = this.continueBatch<TResponseEntity>(
      query,
      this.apolloClient
    ).then((data) => {
      return { rows: this.getRows(data), columns: this.getColumns() };
    });

    this.currentFetchPromise = promise;
    return promise;
  }

  private async continueBatch<
    TData extends BaseEntity,
    TVariables = OperationVariables
  >(
    query: DocumentNode | TypedDocumentNode<TData, TVariables>,
    apolloClient: ApolloClient<NormalizedCacheObject>,
    variables?: TVariables,
    pageSize = 1000
  ): Promise<TData[]> {
    if (this.reachedBatchEnd) {
      return [];
    }

    let attempt = 0;
    const maxAttempts = 10;
    const startCancelCount = Number(this.cancelCount);
    let retryDelayMs: number = 1000;

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    while (attempt < maxAttempts && this.cancelCount === startCancelCount) {
      try {
        if (attempt > 0) {
          await sleep(retryDelayMs);
        }
        const results = await apolloClient.query<BatchQueryResponse<TData>>({
          query,
          variables: {
            ...variables,
            pageSize,
            batchCursor: this.batchCursor,
          },
        });
        this.queryBuilder.setFirstFetchDone(true);
        const dataList: TData[] = results.data.batch ?? [];
        if (dataList.length > 0) {
          this.batchCursor =
            (dataList as any[]).at(-1)[this.orderBy || 'id'] ?? '';
        }

        if (dataList.length < pageSize) {
          this.reachedBatchEnd = true;
        }
        return dataList;
      } catch (e: unknown) {
        ++attempt;
        if (attempt === maxAttempts) {
          throw e;
        }
      }
    }

    return [];
  }

  private async fetchAllInternal(): Promise<{
    rows: GridRowsProp;
    columns: GridColDef[];
  }> {
    const query = this.queryBuilder.buildBatchQuery();
    const startCancelCount = Number(this.cancelCount);
    const batchData: TResponseEntity[] = [];

    do {
      try {
        const dataList: TResponseEntity[] = await this.continueBatch(
          query,
          this.apolloClient
        );
        batchData.push(...dataList);
      } catch (e: unknown) {
        continue;
      }
    } while (!this.reachedBatchEnd && this.cancelCount === startCancelCount);

    const rows = this.getRows(batchData);
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
    this.orderBy = field;
  }

  setOrderDirection(orderDirection: 'asc' | 'desc') {
    this.queryBuilder.setOrderDirection(orderDirection);
  }

  getSubgraphQuery() {
    return this.queryBuilder.build();
  }

  isAtBatchEnd() {
    return this.reachedBatchEnd;
  }

  reset() {
    this.resetBatch();
    this.orderBy = '';
    this.pageSize = MAX_QUERY_PAGE_SIZE;
    this.queryBuilder = new QueryBuilder()
      .setBody(this.getQueryBody())
      .setEntityName(this.getQueryEntityName())
      .setPageSize(this.pageSize);
  }

  resetBatch() {
    this.batchCursor = '';
    this.reachedBatchEnd = false;
    this.queryBuilder.setFirstFetchDone(false);
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
