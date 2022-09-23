import {
  DataGridPro,
  GridRowsProp,
  GridColDef,
  GridValueFormatterParams,
} from '@mui/x-data-grid-pro';
import { useEffect, useState } from 'react';
import { LinearProgress } from '@mui/material';
import { Select } from 'react-daisyui';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid-pro';
import { useExtractooorContext } from '@/shared/Extractooor/ExtractooorProvider';
import { ExtractooorQuery } from '@/shared/Extractooor/Extractooor.type';

export const ExtractorDecimals = (params: GridValueFormatterParams<number>) =>
  params.value ? Number(params.value) : '';

export function ExtractooorToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarExport csvOptions={{ delimiter: ';' }} />
    </GridToolbarContainer>
  );
}

function Extractooor() {
  const { queries } = useExtractooorContext();
  const [query, setQuery] = useState<ExtractooorQuery | undefined>();
  const [currentQueryIndex, setCurrentQueryIndex] = useState<number>(0);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [rows, setRows] = useState<GridRowsProp>([]);

  const maybeResetDataGrid = (queryIndex: number) => {
    if (queries && queries[queryIndex] !== query) {
      setColumns([]);
      setRows([]);
      setCurrentQueryIndex(queryIndex);
      setQuery(queries[queryIndex]);
    }
  };

  useEffect(() => {
    query?.fetch().then(({ rows: rows_, columns: columns_ }) => {
      setRows(rows_);
      setColumns(columns_);
    });
  }, [query]);

  useEffect(() => {
    if (queries && queries.length > 0) {
      setQuery(queries[0]);
    }
  }, [queries]);

  const loading = rows.length === 0 || columns.length === 0;
  return (
    <div className="h-full">
      <Select
        id="query-selector"
        value={currentQueryIndex}
        onChange={(value) => maybeResetDataGrid(Number(value))}
      >
        {(queries || []).map((q, i) => (
          <option key={i} value={i}>
            {q.title}
          </option>
        ))}
      </Select>

      <div className="h-96">
        <DataGridPro
          loading={loading}
          columns={columns}
          rows={rows}
          rowHeight={38}
          pagination
          pageSize={25}
          rowsPerPageOptions={[25]}
          components={{
            Toolbar: ExtractooorToolbar,
            LoadingOverlay: LinearProgress,
          }}
        />
      </div>
    </div>
  );
}

export default Extractooor;
