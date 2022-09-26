/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { baseFields, ExtractooorQueryBase } from './QueryBase';
import { UsdAmount } from '@/shared/Currency/UsdAmount';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';

interface Entity {
  id: string; // ID!
  periodStartUnix: string; // Int!
  pool: {
    id: string; // ID!
    token0: {
      id: string; // ID!
      symbol: string; // String!
    }; // Token!
    token1: {
      id: string; // ID!
      symbol: string; // String!
    }; // Token!
  }; // Pool!
  liquidity: string; // BigInt!
  sqrtPrice: string; //  BigInt!
  token0Price: string; //  BigDecimal!
  token1Price: string; //  BigDecimal!
  tick: string; //  BigInt
  feeGrowthGlobal0X128: string; //  BigInt!
  feeGrowthGlobal1X128: string; //  BigInt!
  tvlUSD: string; //  BigDecimal!
  volumeToken0: string; //  BigDecimal!
  volumeToken1: string; //  BigDecimal!
  volumeUSD: string; //  BigDecimal!
  feesUSD: string; //  BigDecimal
  txCount: string; //  BigInt!
  open: string; //  BigDecimal!
  high: string; //  BigDecimal!
  low: string; //  BigDecimal!
  close: string; //  BigDecimal
}

interface Response {
  poolHourDatas: Entity[];
}

export default class PoolHourDatasQuery extends ExtractooorQueryBase<
  Response,
  Entity
> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('PoolHourDatas', 'PoolHourDatas', apolloClient);
  }

  getQueryEntityName() {
    return 'poolHourDatas';
  }

  getQueryBody() {
    return `
    {
      id
      periodStartUnix
      pool {
        id
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      liquidity
      sqrtPrice
      token0Price
      token1Price
      tick
      feeGrowthGlobal0X128
      feeGrowthGlobal1X128
      tvlUSD
      volumeToken0
      volumeToken1
      volumeUSD
      feesUSD
      txCount
      open
      high
      low
      close
    }`;
  }

  getRows(response: Entity[]): GridRowsProp {
    return response.map((entry) => ({
      ...entry,
      periodStartDate: new Date(Number(entry.periodStartUnix) * 1000),
      token0: entry.pool.token0.id,
      token0Symbol: entry.pool.token0.symbol,
      token1: entry.pool.token1.id,
      token1Symbol: entry.pool.token1.symbol,
      pool: entry.pool.id,
      liquidity: Number(entry.liquidity),
      sqrtPrice: Number(entry.sqrtPrice),
      token0Price: UsdAmount.fromBigDecimal(entry.token0Price),
      token1Price: UsdAmount.fromBigDecimal(entry.token1Price),
      tick: Number(entry.tick),
      feeGrowthGlobal0X128: Number(entry.feeGrowthGlobal0X128),
      feeGrowthGlobal1X128: Number(entry.feeGrowthGlobal1X128),
      tvlUSD: UsdAmount.fromBigDecimal(entry.tvlUSD),
      volumeToken0: TokenAmount.fromBigDecimal(
        entry.volumeToken0,
        this.tokenService.getById(entry.pool.token0.id)!
      ),
      volumeToken1: TokenAmount.fromBigDecimal(
        entry.volumeToken1,
        this.tokenService.getById(entry.pool.token1.id)!
      ),
      volumeUSD: UsdAmount.fromBigDecimal(entry.volumeUSD),
      feesUSD: UsdAmount.fromBigDecimal(entry.feesUSD),
      txCount: Number(entry.txCount),
      open: TokenAmount.fromBigDecimal(
        entry.open,
        this.tokenService.getById(entry.pool.token1.id)!
      ),
      high: TokenAmount.fromBigDecimal(
        entry.high,
        this.tokenService.getById(entry.pool.token1.id)!
      ),
      low: TokenAmount.fromBigDecimal(
        entry.low,
        this.tokenService.getById(entry.pool.token1.id)!
      ),
      close: TokenAmount.fromBigDecimal(
        entry.close,
        this.tokenService.getById(entry.pool.token1.id)!
      ),
    }));
  }

  getColumns(): GridColDef[] {
    return [
      {
        field: 'id',
        headerName: 'ID',
        ...baseFields.id,
      },
      {
        field: 'periodStartUnix',
        headerName: 'Period Start Timestamp',
        ...baseFields.timestamp,
      },
      { field: 'pool', headerName: 'Pool ID', ...baseFields.string },
      {
        field: 'token0',
        headerName: 'Token 0 Symbol',
        ...baseFields.string,
      },
      {
        field: 'token0Symbol',
        headerName: 'Token 0 Symbol',
        ...baseFields.string,
      },
      {
        field: 'token1',
        headerName: 'Token 1 Symbol',
        ...baseFields.string,
      },
      {
        field: 'token1Symbol',
        headerName: 'Token 1 Symbol',
        ...baseFields.string,
      },
      {
        field: 'liquidity',
        headerName: 'Liquidity',
        ...baseFields.integer,
      },
      {
        field: 'sqrtPrice',
        headerName: 'Sqrt Price',
        ...baseFields.integer,
      },
      {
        field: 'token0Price',
        headerName: 'Token0 Price',
        ...baseFields.amount,
      },
      {
        field: 'token1Price',
        headerName: 'Token1 Price',
        ...baseFields.amount,
      },
      {
        field: 'tick',
        headerName: 'Tick',
        ...baseFields.integer,
      },
      {
        field: 'feeGrowthGlobal0X128',
        headerName: 'Fee Growth Global 0 X128',
        ...baseFields.integer,
      },
      {
        field: 'feeGrowthGlobal1X128',
        headerName: 'Fee Growth Global 1 X128',
        ...baseFields.integer,
      },
      {
        field: 'tvlUSD',
        headerName: 'TVL USD',
        ...baseFields.amount,
      },
      {
        field: 'volumeToken0',
        headerName: 'Volume Token 0',
        ...baseFields.amount,
      },
      {
        field: 'volumeToken1',
        headerName: 'Volume Token 1',
        ...baseFields.amount,
      },
      {
        field: 'volumeUSD',
        headerName: 'Volume USD',
        ...baseFields.amount,
      },
      {
        field: 'feesUSD',
        headerName: 'Fees USD',
        ...baseFields.amount,
      },
      {
        field: 'txCount',
        headerName: 'TX Count',
        ...baseFields.integer,
      },
      {
        field: 'open',
        headerName: 'Open',
        ...baseFields.amount,
      },
      {
        field: 'high',
        headerName: 'High',
        ...baseFields.amount,
      },
      {
        field: 'low',
        headerName: 'Low',
        ...baseFields.amount,
      },
      {
        field: 'close',
        headerName: 'Close',
        ...baseFields.amount,
      },
    ];
  }
}
