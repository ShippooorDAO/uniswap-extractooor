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
  tokenDayDatas: {
    id: string; // ID!
    date: string; // Int!
    token: {
      id: string;
      name: string;
    }; // Token!
    volume: string; // BigDecimal!
    volumeUSD: string; // BigDecimal!
    untrackedVolumeUSD: string; // BigDecimal!
    totalValueLocked: string; // BigDecimal!
    totalValueLockedUSD: string; // BigDecimal!
    priceUSD: string; // BigDecimal!
    feesUSD: string; // BigDecimal!
    open: string; // BigDecimal!
    high: string; // BigDecimal!
    low: string; // BigDecimal!
    close: string; // BigDecimal!
  }[];
}

const QUERY = gql`
  {
    tokenDayDatas {
      id
      date
      token {
        id
        name
      }
      volume
      volumeUSD
      untrackedVolumeUSD
      totalValueLocked
      totalValueLockedUSD
      priceUSD
      feesUSD
      open
      high
      low
      close
    }
  }
`;

export default class TokenDayDatasQuery extends ExtractooorQueryBase {
  private readonly baseColumns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
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
      field: 'dateTimestamp',
      headerName: 'Date Timestamp',
      type: 'string',
      width: 150,
    },
    {
      field: 'token',
      headerName: 'Token ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'tokenName',
      headerName: 'Token Name',
      type: 'string',
      width: 150,
    },
    {
      field: 'volume',
      headerName: 'Volume',
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
      field: 'untrackedVolumeUSD',
      headerName: 'Untracked Volume USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'totalValueLocked',
      headerName: 'Total Value Locked',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'totalValueLockedUSD',
      headerName: 'Total Value Locked USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'priceUSD',
      headerName: 'Price USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'feesUSD',
      headerName: 'Fees USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'open',
      headerName: 'Open Price USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'high',
      headerName: 'High Price USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'low',
      headerName: 'Low Price USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'close',
      headerName: 'Close Price USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
  ];

  constructor(
    private readonly apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('TokenDayData', 'TokenDayData');
  }

  private parseResponse(response: Response): GridRowsProp {
    return response.tokenDayDatas.map((entry) => ({
      ...entry,
      date: new Date(Number(entry.date) * 1000),
      dateTimestamp: entry.date,
      token: entry.token.id,
      tokenName: entry.token.name,
      volume: TokenAmount.fromBigDecimal(
        entry.volume,
        this.tokenService.getById(entry.token.id)!
      ),
      volumeUSD: UsdAmount.fromBigDecimal(entry.volumeUSD),
      untrackedVolumeUSD: UsdAmount.fromBigDecimal(entry.untrackedVolumeUSD),
      totalValueLocked: TokenAmount.fromBigDecimal(
        entry.totalValueLocked,
        this.tokenService.getById(entry.token.id)!
      ),
      totalValueLockedUSD: UsdAmount.fromBigDecimal(entry.totalValueLockedUSD),
      priceUSD: UsdAmount.fromBigDecimal(entry.priceUSD),
      feesUSD: UsdAmount.fromBigDecimal(entry.feesUSD),
      open: UsdAmount.fromBigDecimal(entry.open),
      high: UsdAmount.fromBigDecimal(entry.high),
      low: UsdAmount.fromBigDecimal(entry.low),
      close: UsdAmount.fromBigDecimal(entry.close),
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
