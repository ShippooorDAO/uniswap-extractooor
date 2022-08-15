import { GridColDef, GridRowsProp } from '@mui/x-data-grid-pro';

export interface ExtractooorQuery {
  readonly title: string;
  readonly description: string;
  fetch(): Promise<{ rows: GridRowsProp; columns: GridColDef[] }>;
}

export interface ExtractooorProviderState {
  queries?: ExtractooorQuery[];
}
