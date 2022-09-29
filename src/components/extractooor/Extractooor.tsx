import {
  DataGridPro,
  GridRowsProp,
  GridColDef,
  GridValueFormatterParams,
  GridSortModel,
  GridFilterModel,
  GridLinkOperator,
  useGridApiContext,
  GridCsvExportOptions,
  GridFilterPanel,
} from '@mui/x-data-grid-pro';
import { useEffect, useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import {
  Button,
  ButtonProps,
  createSvgIcon,
  Select,
  FormControl,
  MenuItem,
  LinearProgress,
  InputLabel,
  IconButton,
} from '@mui/material';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid-pro';
import { useExtractooorContext } from '@/shared/Extractooor/ExtractooorProvider';
import { ExtractooorQuery } from '@/shared/Extractooor/Extractooor.type';
import { Operator } from '@/shared/Utils/QueryBuilder';
const ExportIcon = createSvgIcon(
  <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />,
  'SaveAlt'
);

const dataGridOperatorsMapping: { [key: string]: Operator } = {
  // number and string
  '=': Operator.EQ,
  '<=': Operator.LTE,
  '<': Operator.LT,
  '>=': Operator.GTE,
  '>': Operator.GT,

  // dateTime
  is: Operator.EQ,
  after: Operator.GT,
  onOrAfter: Operator.GTE,
  before: Operator.GT,
  onOrBefore: Operator.GTE,

  // string
  startsWith: Operator.STARTS_WITH,
  endsWith: Operator.ENDS_WITH,
  contains: Operator.CONTAINS,

  // multi-select
  isAnyOf: Operator.IN,
};

export const ExtractorDecimals = (params: GridValueFormatterParams<number>) =>
  params.value ? Number(params.value) : '';

function Extractooor() {
  const { queries, fullscreen, setFullscreen } = useExtractooorContext();
  const [query, setQuery] = useState<ExtractooorQuery | undefined>();
  const [currentQueryIndex, setCurrentQueryIndex] = useState<number>(0);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [tablePageSize, setTablePageSize] = useState<number>(25);
  const [loadingAll, setLoadingAll] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [queryIsSlow, setQueryIsSlow] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [queryIsSlowTimeout, setQueryIsSlowTimeout] = useState<
    NodeJS.Timeout | undefined
  >();

  const cancel = async () => {
    setCancelling(true);
    clearTimeout(queryIsSlowTimeout);
    setQueryIsSlowTimeout(undefined);
    if (query) {
      await query?.cancel();
    }

    setQueryIsSlow(false);
    setLoadingAll(false);
    setLoading(false);
    setCancelling(false);
  };

  const fetch = async () => {
    await cancel();
    setLoadingAll(false);
    setLoading(true);
    const results = await query?.fetch();
    if (results) {
      setRows(results.rows);
      setColumns(results.columns);
    }
    setLoading(false);
  };

  const maybeResetDataGrid = (queryIndex: number) => {
    if (queries && queries[queryIndex] !== query) {
      setLoading(true);
      setColumns([]);
      setRows([]);
      setCurrentQueryIndex(queryIndex);
      setQuery(queries[queryIndex]);
    }
  };

  const fetchAll = async () => {
    await cancel();
    setLoading(true);
    setLoadingAll(true);
    const queryIsSlowTimeout = setTimeout(() => {
      setQueryIsSlow(true);
    }, 10000);
    setQueryIsSlowTimeout(queryIsSlowTimeout);

    const result = await query?.fetchAll();

    setLoadingAll(false);
    setLoading(false);
    clearTimeout(queryIsSlowTimeout);
    setQueryIsSlow(false);
    setQueryIsSlowTimeout(undefined);

    if (result) {
      setRows(result.rows);
      setColumns(result.columns);
    }
    return result;
  };

  useEffect(() => {
    if (query) {
      fetch();
    } else {
      setLoading(true);
    }
  }, [query]);

  useEffect(() => {
    if (queries && queries.length > 0) {
      setQuery(queries[0]);
    } else {
      setLoading(true);
    }
  }, [queries]);

  function ExtractooorToolbar() {
    const apiRef = useGridApiContext();

    const handleExport = async (options: GridCsvExportOptions) => {
      apiRef.current.exportDataAsCsv(options);
    };

    const buttonBaseProps: ButtonProps = {
      color: 'primary',
      size: 'small',
      startIcon: <ExportIcon />,
    };

    return (
      <GridToolbarContainer>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
          <InputLabel id="demo-simple-select-standard-label">
            Dataset
          </InputLabel>
          <Select
            size="small"
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={currentQueryIndex}
            onChange={(event) => maybeResetDataGrid(Number(event.target.value))}
            label="Dataset"
          >
            {(queries || []).map((q, i) => (
              <MenuItem key={i} value={i}>
                {q.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <Button
          {...buttonBaseProps}
          onClick={() => handleExport({ delimiter: ';' })}
        >
          Export to CSV
        </Button>
        <LoadingButton
          {...buttonBaseProps}
          loading={loadingAll}
          loadingPosition="start"
          onClick={() => fetchAll()}
        >
          {loadingAll ? 'Loading all...' : 'Load all'}
        </LoadingButton>
        <IconButton
          size="large"
          className="hidden xl:inline-flex ml-auto mr-2"
          onClick={() => setFullscreen(!fullscreen)}
        >
          {fullscreen ? (
            <FullscreenExitIcon fontSize="inherit" />
          ) : (
            <FullscreenIcon fontSize="inherit" />
          )}
        </IconButton>
        <Stack sx={{ width: '100%' }} spacing={2}>
          {rows.length < 1000 && rows.length > 0 && (
            <Alert
              severity="success"
              action={
                <Button
                  {...buttonBaseProps}
                  onClick={() => handleExport({ delimiter: ';' })}
                >
                  Export to CSV
                </Button>
              }
            >
              Displaying all results ({rows.length} rows).
            </Alert>
          )}
          {rows.length > 1000 && !loadingAll && (
            <Alert
              severity="success"
              action={
                <Button
                  {...buttonBaseProps}
                  onClick={() => handleExport({ delimiter: ';' })}
                >
                  Export to CSV
                </Button>
              }
            >
              Successfully loaded {rows.length} results.
            </Alert>
          )}
          {rows.length === 1000 && !loadingAll && (
            <Alert
              severity="info"
              action={
                <LoadingButton
                  color="inherit"
                  onClick={() => fetchAll()}
                  loading={loadingAll}
                  size="small"
                  loadingPosition="start"
                >
                  {loadingAll ? 'Loading all...' : 'Load all'}
                </LoadingButton>
              }
            >
              Displaying first 1000 results. You can load all data. It may take
              a few minutes to load over 100'000 rows.
            </Alert>
          )}
          {queryIsSlow && (
            <Alert
              severity="warning"
              action={
                <>
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => {
                      apiRef.current.showFilterPanel();
                    }}
                    disabled={cancelling}
                  >
                    Add Filters
                  </Button>
                  <Button
                    color="warning"
                    size="small"
                    onClick={() => {
                      cancel();
                    }}
                    disabled={cancelling}
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel'}
                  </Button>
                </>
              }
            >
              Query is taking longer than usual to load. There may be too many
              results, try adding filters to limit amount.
            </Alert>
          )}
        </Stack>
      </GridToolbarContainer>
    );
  }

  const handleFilterModelChange = async (model: GridFilterModel) => {
    query?.clearFilters();
    model.items.forEach((item) => {
      const value = item.value;
      const field = item.columnField;
      if (!value || value === '') {
        return;
      }

      const operator =
        dataGridOperatorsMapping[item.operatorValue || ''] || Operator.EQ;

      query?.addFilter(field, operator, value);
    });

    await fetch();
  };

  const handleSortModelChange = async (model: GridSortModel) => {
    if (model.length === 0) {
      query?.reset();
      return;
    }

    // MUI Data Grid Free License only supports one sort model.
    // We can just pick the first one.
    const { field, sort } = model[0]!;
    if (!field) {
      query?.reset();
      return;
    }

    query?.setOrderBy(field);
    if (sort === 'asc' || sort === 'desc') {
      query?.setOrderDirection(sort);
    }

    await fetch();
  };

  return (
    <div className="h-[calc(100vh-64px)] sm:h-[calc(100vh-150px)]">
      <DataGridPro
        rows={rows}
        columns={columns}
        rowsPerPageOptions={[tablePageSize]}
        rowCount={rows.length}
        getRowClassName={() => 'cursor-pointer'}
        pagination
        filterMode="server"
        sortingMode="server"
        loading={loading}
        pageSize={tablePageSize}
        onPageSizeChange={setTablePageSize}
        onFilterModelChange={handleFilterModelChange}
        onSortModelChange={handleSortModelChange}
        initialState={{
          filter: {
            filterModel: {
              items: [],
              quickFilterLogicOperator: GridLinkOperator.And,
            },
          },
        }}
        components={{
          Toolbar: ExtractooorToolbar,
          LoadingOverlay: LinearProgress,
          FilterPanel: GridFilterPanel,
        }}
      />
    </div>
  );
}

export default Extractooor;
