import { GridColDef, GridRowsProp } from '@mui/x-data-grid-premium';
import { DocumentNode } from 'graphql';
import { Operator } from '../Utils/QueryBuilder';

export type Column = GridColDef & {
  filterPriority?: number;
  filterField?: string;
  filterParser?: (value: string | string[]) => string | number;
  toExcel?: (value: any) => any;
};

export interface ExtractooorQuery {
  readonly title: string;
  readonly description: string;
  fetchNext(): Promise<{ rows: GridRowsProp; columns: Column[] }>;
  fetchAll(): Promise<{ rows: GridRowsProp; columns: Column[] }>;
  addFilter(field: string, operator: Operator, value: string | string[]): void;
  removeFilter(field: string): void;
  clearFilters(): void;
  setPage(page: number): void;
  setPageSize(pageSize: number): void;
  getPageSize(): number;
  setOrderBy(field: string): void;
  setOrderDirection(orderDirection: 'asc' | 'desc'): void;
  getSubgraphQuery(): DocumentNode;
  isAtBatchEnd(): boolean;
  getExcelFields(columns: Column[]): string[];
  reset(): void;
  resetBatch(): void;
  cancel(): void;
}

export interface ExtractooorProviderState {
  queries?: ExtractooorQuery[];
  fullscreen: boolean;
  setFullscreen: (value: boolean) => void;
}
