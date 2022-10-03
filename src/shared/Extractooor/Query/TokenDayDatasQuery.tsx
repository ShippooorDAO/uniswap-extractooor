/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ExtractooorQueryBase } from './QueryBase';
import { UsdAmount } from '@/shared/Currency/UsdAmount';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';

interface Entity {
  id: string; // ID!
  date: string; // Int!
  token: {
    id: string;
    symbol: string;
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
}

export default class TokenDayDatasQuery extends ExtractooorQueryBase<Entity> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    tokenService: TokenService
  ) {
    super('TokenDayData', 'TokenDayData', apolloClient, tokenService);
  }

  getQueryEntityName() {
    return 'tokenDayDatas';
  }

  getQueryBody() {
    return `{
      id
      date
      token {
        id
        symbol
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
    }`;
  }

  getColumns(): GridColDef[] {
    return [
      {
        field: 'id',
        headerName: 'ID',
        ...this.baseFields.id,
      },
      {
        field: 'date',
        headerName: 'Date',
        ...this.baseFields.timestamp,
      },
      {
        field: 'token',
        headerName: 'Token',
        ...this.baseFields.token,
      },
      {
        field: 'tokenSymbol',
        headerName: 'Token Symbol',
        ...this.baseFields.string,
        filterable: false,
        sortable: false,
      },
      {
        field: 'volume',
        headerName: 'Volume',
        ...this.baseFields.amount,
      },
      {
        field: 'volumeUSD',
        headerName: 'Volume USD',
        ...this.baseFields.amount,
      },
      {
        field: 'untrackedVolumeUSD',
        headerName: 'Untracked Volume USD',
        ...this.baseFields.amount,
      },
      {
        field: 'totalValueLocked',
        headerName: 'Total Value Locked',
        ...this.baseFields.amount,
      },
      {
        field: 'totalValueLockedUSD',
        headerName: 'Total Value Locked USD',
        ...this.baseFields.amount,
      },
      {
        field: 'priceUSD',
        headerName: 'Price USD',
        ...this.baseFields.amount,
      },
      {
        field: 'feesUSD',
        headerName: 'Fees USD',
        ...this.baseFields.amount,
      },
      {
        field: 'open',
        headerName: 'Open Price USD',
        ...this.baseFields.amount,
      },
      {
        field: 'high',
        headerName: 'High Price USD',
        ...this.baseFields.amount,
      },
      {
        field: 'low',
        headerName: 'Low Price USD',
        ...this.baseFields.amount,
      },
      {
        field: 'close',
        headerName: 'Close Price USD',
        ...this.baseFields.amount,
      },
    ];
  }

  getRows(response: Entity[]): GridRowsProp {
    return response.map((entry) => ({
      ...entry,
      date: new Date(Number(entry.date) * 1000),
      token: entry.token.id,
      tokenSymbol: entry.token.symbol,
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
}
