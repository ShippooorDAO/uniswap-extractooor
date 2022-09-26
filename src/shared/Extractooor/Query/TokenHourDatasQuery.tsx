/* eslint-disable class-methods-use-this */

import { GridRowsProp } from '@mui/x-data-grid-pro';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { baseFields, ExtractooorQueryBase } from './QueryBase';
import { UsdAmount } from '@/shared/Currency/UsdAmount';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';

interface Entity {
  id: string; // ID!
  periodStartUnix: string; // Int!
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

interface Response {
  tokenHourDatas: Entity[];
}

export default class TokenHourDatasQuery extends ExtractooorQueryBase<
  Response,
  Entity
> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('TokenHourData', 'TokenHourData', apolloClient);
  }

  getQueryEntityName() {
    return 'tokenHourDatas';
  }

  getQueryBody() {
    return `{
      id
      periodStartUnix
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

  getRows(response: Entity[]): GridRowsProp {
    return response.map((entry) => ({
      ...entry,
      periodStartTimestamp: new Date(Number(entry.periodStartUnix) * 1000),
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

  getColumns() {
    return [
      {
        field: 'id',
        headerName: 'ID',
        ...baseFields.id,
      },
      {
        field: 'periodStartTimestamp',
        headerName: 'Period Start Timestamp',
        ...baseFields.timestamp,
      },
      {
        field: 'token',
        headerName: 'Token ID',
        ...baseFields.string,
      },
      {
        field: 'tokenSymbol',
        headerName: 'Token Symbol',
        ...baseFields.string,
      },
      {
        field: 'volume',
        headerName: 'Volume',
        ...baseFields.amount,
      },
      {
        field: 'volumeUSD',
        headerName: 'Volume USD',
        ...baseFields.amount,
      },
      {
        field: 'untrackedVolumeUSD',
        headerName: 'Untracked Volume USD',
        ...baseFields.amount,
      },
      {
        field: 'totalValueLocked',
        headerName: 'Total Value Locked',
        ...baseFields.amount,
      },
      {
        field: 'totalValueLockedUSD',
        headerName: 'Total Value Locked USD',
        ...baseFields.amount,
      },
      {
        field: 'priceUSD',
        headerName: 'Price USD',
        ...baseFields.amount,
      },
      {
        field: 'feesUSD',
        headerName: 'Fees USD',
        ...baseFields.amount,
      },
      {
        field: 'open',
        headerName: 'Open Price USD',
        ...baseFields.amount,
      },
      {
        field: 'high',
        headerName: 'High Price USD',
        ...baseFields.amount,
      },
      {
        field: 'low',
        headerName: 'Low Price USD',
        ...baseFields.amount,
      },
      {
        field: 'close',
        headerName: 'Close Price USD',
        ...baseFields.amount,
      },
    ];
  }
}
