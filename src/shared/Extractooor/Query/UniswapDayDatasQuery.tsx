/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { baseFields, ExtractooorQueryBase } from './QueryBase';
import { UsdAmount } from '@/shared/Currency/UsdAmount';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';

interface Entity {
  id: string; // ID!
  date: string; // Int!
  volumeETH: string; // BigDecimal!
  volumeUSD: string; // BigDecimal!
  volumeUSDUntracked: string; // BigDecimal!
  feesUSD: string; // BigDecimal!
  txCount: string; // BigInt!
  tvlUSD: string; // BigDecimal!
}

interface Response {
  uniswapDayDatas: Entity[];
}

export default class UniswapDayDatasQuery extends ExtractooorQueryBase<
  Response,
  Entity
> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    tokenService: TokenService
  ) {
    super('UniswapDayData', 'UniswapDayData', apolloClient, tokenService);
  }

  getQueryEntityName() {
    return 'uniswapDayDatas';
  }

  getQueryBody() {
    return `{
      id
      date
      volumeETH
      volumeUSD
      volumeUSDUntracked
      feesUSD
      txCount
      tvlUSD
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
        field: 'volumeETH',
        headerName: 'Volume ETH',
        ...this.baseFields.amount,
      },
      {
        field: 'volumeUSD',
        headerName: 'Volume USD',
        ...this.baseFields.amount,
      },
      {
        field: 'volumeUSDUntracked',
        headerName: 'Volume USD Untracked',
        ...this.baseFields.amount,
      },
      {
        field: 'feesUSD',
        headerName: 'Feed USD',
        ...this.baseFields.amount,
      },
      {
        field: 'txCount',
        headerName: 'TX Count',
        ...this.baseFields.integer,
      },
      {
        field: 'tvlUSD',
        headerName: 'TVL USD',
        ...this.baseFields.amount,
      },
    ];
  }

  getRows(response: Entity[]): GridRowsProp {
    return response.map((entry) => ({
      ...entry,
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
}
