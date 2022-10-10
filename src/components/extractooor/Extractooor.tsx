import {
  DataGridPremium,
  GridRowsProp,
  GridValueFormatterParams,
  GridSortModel,
  GridFilterModel,
  GridRowId,
  GridLinkOperator,
  useGridApiRef,
  GridFilterPanel,
  GridCsvExportMenuItem,
  GridExcelExportMenuItem,
  GridToolbarExportContainer,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid-premium';
import { useEffect, useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import DataObjectIcon from '@mui/icons-material/DataObject';
import {
  Button,
  ButtonProps,
  Select,
  FormControl,
  MenuItem,
  LinearProgress,
  InputLabel,
  IconButton,
  Box,
  Modal,
  Typography,
  Tooltip,
  ClickAwayListener,
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useExtractooorContext } from '@/shared/Extractooor/ExtractooorProvider';
import {
  Column,
  ExtractooorQuery,
} from '@/shared/Extractooor/Extractooor.type';
import { Operator, QuerySizeError } from '@/shared/Utils/QueryBuilder';
import { print } from 'graphql/language/printer';

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

const CopyToClipboardButton = ({ content }: { content: string }) => {
  const [tooltipText, setTooltipText] = useState<string>('Click to copy');

  const handleClick = () => {
    navigator.clipboard.writeText(content);
    setTooltipText('Copied!');
  };

  return (
    <Tooltip title={tooltipText} placement="top">
      <Button
        variant="outlined"
        onClick={handleClick}
        startIcon={<ContentCopyIcon />}
        onMouseOut={() =>
          setTimeout(() => setTooltipText('Click to copy'), 500)
        }
      >
        Copy
      </Button>
    </Tooltip>
  );
};

function Extractooor() {
  const apiRef = useGridApiRef();

  const { queries, fullscreen, setFullscreen } = useExtractooorContext();
  const [query, setQuery] = useState<ExtractooorQuery | undefined>();
  const [currentQueryIndex, setCurrentQueryIndex] = useState<number>(0);
  const [columns, setColumns] = useState<Column[]>([]);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const [tablePageSize, setTablePageSize] = useState<number>(25);
  const [loadingAll, setLoadingAll] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [queryIsSlow, setQueryIsSlow] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [queryIsSlowTimeout, setQueryIsSlowTimeout] = useState<
    NodeJS.Timeout | undefined
  >();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [page, setPage] = useState<number>(0);

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

  const startNewBatch = async () => {
    await cancel();
    setLoadingAll(false);
    setLoading(true);

    query?.resetBatch();
    setPage(0);
    const results = await query?.fetchNext();
    if (results) {
      setRows(results.rows);
      setColumns(results.columns);
    }

    setLoading(false);
  };

  const continueBatch = async () => {
    if (query?.isAtBatchEnd()) {
      // Don't continue the batch when the end is reached because the is no more
      // data that can be fetched. We want to save network calls.
      return;
    }

    await cancel();
    setLoadingAll(false);
    setLoading(true);

    const results = await query?.fetchNext();
    if (results) {
      setRows(rows.concat(results.rows));
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
      setRows(rows.concat(result.rows));
      setColumns(result.columns);
    }
    return result;
  };

  useEffect(() => {
    if (query) {
      apiRef.current.setColumnVisibilityModel(
        query?.getColumnVisibilityModel() ?? {}
      );
      startNewBatch();
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
    const buttonBaseProps: ButtonProps = {
      color: 'primary',
      size: 'small',
    };

    return (
      <GridToolbarContainer className="flex gap-2">
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
        <GridToolbarColumnsButton variant="outlined" />
        <GridToolbarFilterButton
          componentsProps={{ button: { variant: 'outlined' } }}
        />

        <LoadingButton
          {...buttonBaseProps}
          variant="outlined"
          startIcon={<ViewListIcon />}
          loading={loadingAll}
          loadingPosition="start"
          onClick={() => fetchAll()}
        >
          {loadingAll ? 'Loading all...' : 'Load all'}
        </LoadingButton>
        <GridToolbarExportContainer variant="outlined" {...buttonBaseProps}>
          <GridCsvExportMenuItem options={{ delimiter: ';' }} />
          <GridExcelExportMenuItem
            options={{ fields: query?.getExcelFields(columns) }}
          />
        </GridToolbarExportContainer>
        <Button
          {...buttonBaseProps}
          variant="outlined"
          startIcon={<DataObjectIcon />}
          onClick={handleOpen}
        >
          View GraphQL Query
        </Button>
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
          {query?.isAtBatchEnd() && rows.length === 0 && !loadingAll && (
            <Alert severity="info">
              Query done, but no results matching the query
            </Alert>
          )}
          {query?.isAtBatchEnd() && rows.length > 0 && !loadingAll && (
            <Alert
              severity="success"
              action={
                <GridToolbarExportContainer {...buttonBaseProps}>
                  <GridCsvExportMenuItem options={{ delimiter: ';' }} />
                  <GridExcelExportMenuItem
                    options={{ fields: query?.getExcelFields(columns) }}
                  />
                </GridToolbarExportContainer>
              }
            >
              Loaded all results ({rows.length} rows).
            </Alert>
          )}
          {!query?.isAtBatchEnd() && !loadingAll && (
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
              Loaded {rows.length} results. You can load all data. It may take a
              few minutes to load over 100'000 rows.
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

  const handlePageChange = async (newPage: number) => {
    setPage(newPage);
    const endPage = Math.ceil(rows.length / tablePageSize - 1);
    if (newPage === endPage && !query?.isAtBatchEnd()) {
      await continueBatch();
    }
  };

  const handleFilterModelChange = async (model: GridFilterModel) => {
    query?.clearFilters();
    for (let i = 0; i < model.items.length; ++i) {
      for (let j = i + 1; j < model.items.length; ++j) {
        const [itemA, itemB] = [model.items[i], model.items[j]];

        if (!itemA || !itemB) {
          continue;
        }
        const columnA = columns.find(
          (column) => column.filterField ?? column.field === itemA?.columnField
        );
        const columnB = columns.find(
          (column) => column.filterField ?? column.field === itemB?.columnField
        );

        if (!columnA || !columnB) {
          continue;
        }

        const filterFieldA = columnA.filterField ?? columnA.field;
        const filterFieldB = columnB.filterField ?? columnB.field;

        if (filterFieldA !== filterFieldB) {
          continue;
        }

        if ((columnA.filterPriority ?? 0) > (columnB.filterPriority ?? 0)) {
          apiRef.current.deleteFilterItem(itemB);
          return;
        } else {
          apiRef.current.deleteFilterItem(itemA);
          return;
        }
      }
    }

    model.items.forEach((item) => {
      const value = item.value;
      const field = item.columnField;
      if (!value || value === '') {
        return;
      }

      const operator =
        dataGridOperatorsMapping[item.operatorValue || ''] || Operator.EQ;

      try {
        query?.addFilter(field, operator, value);
      } catch (e) {
        if (e instanceof QuerySizeError) {
          alert(
            'Compiled query size exceeds subgraph limit. Please try different filters.'
          );
          // rollback current change
          apiRef.current.deleteFilterItem(item);
        }
      }
    });

    await startNewBatch();
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

    await startNewBatch();
  };

  return (
    <div className="h-[calc(100vh-64px)] sm:h-[calc(100vh-150px)]">
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: 'absolute' as 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '80%',
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Subgraph Query
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{ mt: 2, height: '80%' }}
          >
            <div className="flex gap-2 pb-4">
              {query && (
                <CopyToClipboardButton
                  content={print(query.getSubgraphQuery())}
                />
              )}
              <Button
                variant="outlined"
                startIcon={
                  <img
                    className="h-5 w-5"
                    src="/assets/images/the-graph-logo.svg"
                  />
                }
                onClick={() =>
                  window.open(
                    'https://thegraph.com/hosted-service/subgraph/uniswap/uniswap-v3'
                  )
                }
              >
                Open Subgraph explorer
              </Button>
            </div>
            <textarea className="w-full h-full font-mono py-4 px-4" disabled>
              {query ? print(query.getSubgraphQuery()) : 'No Query'}
            </textarea>
          </Typography>
        </Box>
      </Modal>
      <ClickAwayListener
        onClickAway={(event) => {
          const target = event.target as unknown as any;
          if (target && target.localName === 'body') {
            return;
          }
          setSelectionModel([]);
        }}
      >
        <DataGridPremium
          apiRef={apiRef}
          rows={rows}
          columns={columns}
          disableRowGrouping
          rowsPerPageOptions={[tablePageSize]}
          rowCount={rows.length}
          getRowClassName={() => 'cursor-pointer'}
          pagination
          onPageChange={handlePageChange}
          page={page}
          filterMode="server"
          sortingMode="server"
          loading={loading}
          pageSize={tablePageSize}
          onPageSizeChange={setTablePageSize}
          onFilterModelChange={handleFilterModelChange}
          onSortModelChange={handleSortModelChange}
          onSelectionModelChange={(selectionModel) =>
            setSelectionModel(selectionModel)
          }
          selectionModel={selectionModel}
          componentsProps={{
            filterPanel: {
              linkOperators: [GridLinkOperator.And],
            },
            loadingOverlay: {
              style: {
                zIndex: 1,
              },
            },
          }}
          initialState={{
            filter: {
              filterModel: {
                items: [],
                linkOperator: GridLinkOperator.And,
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
      </ClickAwayListener>
    </div>
  );
}

export default Extractooor;
