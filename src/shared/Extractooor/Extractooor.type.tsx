import { GridColDef, GridRowsProp } from '@mui/x-data-grid-pro';
import { CurrencyAmount } from '../Currency/CurrencyAmount';
import { Operator } from '../Utils/QueryBuilder';

export interface ExtractooorQuery {
  readonly title: string;
  readonly description: string;
  fetch(): Promise<{ rows: GridRowsProp; columns: GridColDef[] }>;
  fetchAll(): Promise<{ rows: GridRowsProp; columns: GridColDef[] }>;
  addFilter(field: string, operator: Operator, value: string | string[]): void;
  removeFilter(field: string): void;
  clearFilters(): void;
  setPage(page: number): void;
  setPageSize(pageSize: number): void;
  getPageSize(): void;
  setOrderBy(field: string): void;
  setOrderDirection(orderDirection: 'asc' | 'desc'): void;
  reset(): void;
  cancel(): void;
}

export interface ExtractooorProviderState {
  queries?: ExtractooorQuery[];
}
