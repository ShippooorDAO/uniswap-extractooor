/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import { ReactNode } from 'react';
import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { ExtractooorQueryBase } from './QueryBase';
import { UsdAmount } from '@/shared/Currency/UsdAmount';
import { AmountFormatter } from '@/shared/Utils/DataGrid';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';

interface Response {
  uniswapDayDatas: {
    id: string; // ID!
    date: string; // Int!
    volumeETH: string; // BigDecimal!
    volumeUSD: string; // BigDecimal!
    volumeUSDUntracked: string; // BigDecimal!
    feesUSD: string; // BigDecimal!
    txCount: string; // BigInt!
    tvlUSD: string; // BigDecimal!
  }[];
}

const QUERY = gql`
  {
    uniswapDayDatas {
      id
      date
      volumeETH
      volumeUSD
      volumeUSDUntracked
      feesUSD
      txCount
      tvlUSD
    }
  }
`;

export default class UniswapDayDatasQuery extends ExtractooorQueryBase {
  private readonly baseColumns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'dateTimestamp',
      headerName: 'Date Timestamp',
      type: 'string',
      width: 150,
    },
    {
      field: 'date',
      headerName: 'Date',
      type: 'dateTime',
      width: 150,
    },
    {
      field: 'volumeETH',
      headerName: 'Volume ETH',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'volumeUSD',
      headerName: 'Volume USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'volumeUSDUntracked',
      headerName: 'Volume USD Untracked',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'feesUSD',
      headerName: 'Feed USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'txCount',
      headerName: 'TX Count',
      type: 'number',
      width: 150,
    },
    {
      field: 'tvlUSD',
      headerName: 'TVL USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
  ];

  constructor(
    private readonly apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('UniswapDayData', 'UniswapDayData');
  }

  private parseResponse(response: Response): GridRowsProp {
    return response.uniswapDayDatas.map((entry) => ({
      ...entry,
      dateTimestamp: entry.date,
      date: new Date(Number(entry.date) * 1000),
      volumeETH: TokenAmount.fromBigDecimal(
        entry.volumeETH,
        this.tokenService.getBySymbol('ETH')!
      ),
      volumeUSD: UsdAmount.fromBigDecimal(entry.volumeUSD),
      volumeUSDUntracked: UsdAmount.fromBigDecimal(entry.volumeUSDUntracked),
      feesUSD: UsdAmount.fromBigDecimal(entry.feesUSD),
      txCount: Number(entry.txCount),
      tvlUSD: UsdAmount.fromBigDecimal(entry.feesUSD),
    }));
  }

  async fetch(): Promise<{ rows: GridRowsProp; columns: GridColDef[] }> {
    const response = await this.apolloClient.query<Response>({
      query: QUERY,
    });
    const rows = this.parseResponse(response.data);
    return { rows, columns: this.baseColumns };
  }

  form(): ReactNode {
    return <div />;
  }
}
