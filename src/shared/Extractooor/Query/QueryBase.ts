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
  GridValueGetterParams,
  GridValueFormatterParams,
} from '@mui/x-data-grid-premium';
import {
  Column,
  ExtractooorQuery,
  ExtractooorFetchResult,
} from '../Extractooor.type';
import {
  BaseEntity,
  BatchQueryResponse,
} from '@/shared/UniswapV3Subgraph/UniswapV3Subgraph.type';
import { TokenService } from '@/shared/Currency/TokenService';
import { UniswapPoolService } from '@/shared/UniswapPool/UniswapPoolService';
import { CurrencyAmount } from '@/shared/Currency/CurrencyAmount';

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
  private currentFetchPromise?: Promise<ExtractooorFetchResult>;
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
      sortable: false,
      renderCell: UniswapTokenRenderCell,
      width: 150,
    },
    pool: {
      type: 'singleSelect',
      valueOptions: this.uniswapPoolService.getAll().map((pool) => ({
        label: `${pool.token0.symbol}/${pool.token1.symbol} (${
          pool.feeTier * 100
        }%) ${pool.id}`,
        value: pool.id,
      })),
      filterOperators: getGridSingleSelectOperators().filter((operator) =>
        ['isAnyOf'].includes(operator.value)
      ),
      sortable: false,
      renderCell: UniswapPoolRenderCell,
      width: 150,
    },
    poolTokens: {
      headerName: 'Pool Tokens',
      filterField: 'pool',
      type: 'singleSelect',
      valueOptions: this.tokenService.getAll().map((token) => ({
        label: `${token.symbol} (${token.id})`,
        value: token.id,
      })),
      filterOperators: getGridSingleSelectOperators().filter((operator) =>
        ['isAnyOf'].includes(operator.value)
      ),
      filterParser: (values: string | string[]) => {
        if (typeof values === 'string') {
          const token = this.tokenService.getById(values);
          if (token) {
            return parseStringFilter(
              this.uniswapPoolService
                .getPoolsForToken(token)
                ?.map((pool) => pool.id) ?? []
            );
          }
          return '';
        }

        const poolIds = values.reduce((aggregate, tokenId) => {
          const token = this.tokenService.getById(tokenId);
          if (token) {
            const pools = this.uniswapPoolService.getPoolsForToken(token);
            if (pools) {
              aggregate.push(...pools.map((pool) => pool.id));
            }
          }
          return aggregate;
        }, new Array<string>());
        return parseStringFilter(poolIds);
      },
      valueGetter: (params: GridValueGetterParams) => {
        const poolId = params.row.pool;
        const pool = this.uniswapPoolService.getPoolById(poolId);
        if (!pool) {
          return null;
        }
        return `${pool.token0.symbol} / ${pool.token1.symbol}`;
      },
      sortable: false,
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
      toExcel: (value?: CurrencyAmount) => value?.toNumber(),
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
    readonly tokenService: TokenService,
    readonly uniswapPoolService: UniswapPoolService
  ) {
    this.reset();
  }

  async fetchNext(): Promise<ExtractooorFetchResult> {
    // TODO: Consider making this a while loop to wait until all
    // the queued fetchNext messages are consumed before queueing
    // a new fetch.
    if (this.currentFetchPromise) {
      await this.currentFetchPromise;
    }
    const query = this.queryBuilder.buildBatchQuery();
    const promise = this.continueBatch<TResponseEntity>(
      query,
      this.apolloClient
    ).then(({ rows, valid }) => {
      return {
        rows: this.getRows(rows),
        columns: this.getColumnsInternal(),
        valid,
      };
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
  ): Promise<{ rows: TData[]; valid: boolean }> {
    if (this.reachedBatchEnd) {
      return { rows: [], valid: false };
    }

    let attempt = 0;
    const maxAttempts = 10;
    const startCancelCount = Number(this.cancelCount);
    let retryDelayMs: number = 1000;

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    while (attempt < maxAttempts && this.cancelCount === startCancelCount) {
      let results;
      try {
        if (attempt > 0) {
          await sleep(retryDelayMs);
        }
        results = await apolloClient.query<BatchQueryResponse<TData>>({
          query,
          variables: {
            ...variables,
            pageSize,
            batchCursor: this.batchCursor,
          },
        });
      } catch (e: unknown) {
        ++attempt;
        if (attempt === maxAttempts) {
          throw e;
        }
      }

      if (startCancelCount !== this.cancelCount) {
        // Drop the results if the query was cancelled while the subgraph query was ongoing.
        return { rows: [], valid: false };
      }

      this.queryBuilder.setFirstFetchDone(true);
      if (this.queryBuilder.getOrderBy()) {
        // Do not allow continuing the batch if it is a sorted query because
        // it isn't possible to batch sorted queries at the moment.
        this.reachedBatchEnd = true;
      }

      const dataList: TData[] = results?.data.batch ?? [];
      if (dataList.length > 0) {
        // Set the cursor for the next fetch as the last row of the current batch.
        this.batchCursor =
          (dataList as any[]).at(-1)[this.orderBy || 'id'] ?? '';
      }

      if (dataList.length < pageSize) {
        this.reachedBatchEnd = true;
      }
      return { rows: dataList, valid: true };
    }

    return { rows: [], valid: false };
  }

  private async fetchAllInternal(): Promise<ExtractooorFetchResult> {
    const query = this.queryBuilder.buildBatchQuery();
    const startCancelCount = Number(this.cancelCount);
    const batchData: TResponseEntity[] = [];

    do {
      try {
        const { rows } = await this.continueBatch<TResponseEntity>(
          query,
          this.apolloClient
        );
        batchData.push(...rows);
      } catch (e: unknown) {
        continue;
      }
    } while (!this.reachedBatchEnd && this.cancelCount === startCancelCount);

    const rows = this.getRows(batchData);
    const columns = this.getColumnsInternal();

    return { rows, columns, valid: this.cancelCount === startCancelCount };
  }

  private getExcelColumnField(column: Column) {
    return column.field + '-excel';
  }

  getExcelFields(columns: Column[]): string[] {
    return columns
      .filter((column) => !column.toExcel)
      .map((column) => column.field);
  }

  async fetchAll(): Promise<ExtractooorFetchResult> {
    if (this.currentFetchPromise) {
      await this.currentFetchPromise;
    }
    const promise = this.fetchAllInternal();
    this.currentFetchPromise = promise;
    return promise;
  }

  addFilter(field: string, operator: Operator, value: string | string[]) {
    const columnDef = this.getColumnsInternal().find(
      (column) => column.field === field
    );
    const filterParser = columnDef?.filterParser ?? DEFAULT_FILTER_PARSER;
    const filterField = columnDef?.filterField ?? field;

    this.queryBuilder.addFilter(filterField, operator, filterParser(value));
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
    const columnDef = this.getColumnsInternal().find(
      (column) => column.field === field
    );
    const sortField = columnDef?.filterField ?? field;

    this.queryBuilder.setOrderBy(sortField);
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

  getColumnVisibilityModel() {
    const model: { [key: string]: boolean } = {};
    for (const column of this.getColumnsInternal()) {
      model[column.field] = column.hidden === false;
    }
    return model;
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

  private addExcelColumns(columns: Column[]) {
    const baseExcelField = {
      hidden: true,
      hideable: false,
      filterable: false,
      hide: true,
      sortable: false,
    };

    const excelColumns = columns
      .filter((column) => !!column.toExcel)
      .map((column) => {
        return {
          ...baseExcelField,
          headerName: `${column.headerName} (Excel)`,
          type: column.type,
          field: this.getExcelColumnField(column),
          valueGetter: (params: GridValueGetterParams) =>
            column.toExcel!(params.row[column.field]),
        };
      });

    return [...columns, ...excelColumns];
  }

  private addUnixTimestampColumns(columns: Column[]) {
    const baseUnixTimestampField = {
      ...this.baseFields.integer,
      width: 150,
      valueFormatter: (params: GridValueFormatterParams<number>) =>
        params.value?.toString(),
    };

    return columns.reduce((aggregate, column) => {
      aggregate.push(column);
      if (column.type === 'dateTime') {
        aggregate.push({
          ...baseUnixTimestampField,
          field: `${column.headerName}-unix`,
          filterField: column.field,
          headerName: `${column.headerName} (Unix)`,
          valueGetter: (params: GridValueGetterParams) =>
            params.row[column.field]
              ? Math.floor(params.row[column.field].getTime() / 1000)
              : undefined,
        });
      }
      return aggregate;
    }, new Array<Column>());
  }

  private getColumnsInternal(): Column[] {
    let columns = this.getColumns();
    columns = this.addExcelColumns(columns);
    columns = this.addUnixTimestampColumns(columns);
    return columns;
  }

  protected abstract getQueryBody(): string;
  protected abstract getQueryEntityName(): string;
  protected abstract getColumns(): Column[];
  protected abstract getRows(data: TResponseEntity[]): GridRowsProp;
}
