/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-premium';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ExtractooorQueryBase } from './QueryBase';
import { UsdAmount } from '@/shared/Currency/UsdAmount';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';
import { UniswapPoolService } from '@/shared/UniswapPool/UniswapPoolService';

interface Entity {
  id: string; // ID!
  date: number; // Int!
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

export default class PoolDayDatasQuery extends ExtractooorQueryBase<Entity> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    tokenService: TokenService,
    uniswapPoolService: UniswapPoolService
  ) {
    super(
      'PoolDayDatas',
      'PoolDayDatas',
      apolloClient,
      tokenService,
      uniswapPoolService
    );
  }

  getQueryEntityName() {
    return 'poolDayDatas';
  }

  getQueryBody() {
    return `
    {
      id
      date
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

  getColumns(): GridColDef[] {
    return [
      { field: 'id', headerName: 'ID', ...this.baseFields.id },
      { field: 'date', headerName: 'Timestamp', ...this.baseFields.timestamp },
      {
        field: 'pool',
        headerName: 'Pool',
        ...this.baseFields.pool,
      },
      {
        field: 'token0',
        headerName: 'Token 0',
        ...this.baseFields.poolToken,
        sortable: false,
      },
      {
        field: 'token1',
        headerName: 'Token 1',
        ...this.baseFields.poolToken,
        sortable: false,
      },
      {
        field: 'token0Symbol',
        headerName: 'Token 0 Symbol',
        ...this.baseFields.string,
        filterable: false,
        sortable: false,
      },
      {
        field: 'token1Symbol',
        headerName: 'Token 1 Symbol',
        ...this.baseFields.string,
        filterable: false,
        sortable: false,
      },
      {
        field: 'liquidity',
        headerName: 'Liquidity',
        ...this.baseFields.integer,
      },
      {
        field: 'sqrtPrice',
        headerName: 'Sqrt Price',
        ...this.baseFields.integer,
      },
      {
        field: 'token0Price',
        headerName: 'Token0 Price',
        ...this.baseFields.amount,
      },
      {
        field: 'token1Price',
        headerName: 'Token1 Price',
        ...this.baseFields.amount,
      },
      {
        field: 'tick',
        headerName: 'Tick',
        ...this.baseFields.integer,
      },
      {
        field: 'feeGrowthGlobal0X128',
        headerName: 'Fee Growth Global 0 X128',
        ...this.baseFields.integer,
      },
      {
        field: 'feeGrowthGlobal1X128',
        headerName: 'Fee Growth Global 1 X128',
        ...this.baseFields.integer,
      },
      {
        field: 'tvlUSD',
        headerName: 'TVL USD',
        ...this.baseFields.amount,
      },
      {
        field: 'volumeToken0',
        headerName: 'Volume Token 0',
        ...this.baseFields.amount,
      },
      {
        field: 'volumeToken1',
        headerName: 'Volume Token 1',
        ...this.baseFields.amount,
      },
      {
        field: 'volumeUSD',
        headerName: 'Volume USD',
        ...this.baseFields.amount,
      },
      {
        field: 'feesUSD',
        headerName: 'Fees USD',
        ...this.baseFields.amount,
      },
      {
        field: 'txCount',
        headerName: 'TX Count',
        ...this.baseFields.integer,
      },
      {
        field: 'open',
        headerName: 'Open',
        ...this.baseFields.amount,
      },
      {
        field: 'high',
        headerName: 'High',
        ...this.baseFields.amount,
      },
      {
        field: 'low',
        headerName: 'Low',
        ...this.baseFields.amount,
      },
      {
        field: 'close',
        headerName: 'Close',
        ...this.baseFields.amount,
      },
    ];
  }

  getRows(response: Entity[]): GridRowsProp {
    return response.map((entry) => {
      const token0 = this.tokenService.getById(entry.pool.token0.id)!;
      const token1 = this.tokenService.getById(entry.pool.token1.id)!;
      return {
        ...entry,
        pool: entry.pool.id,
        token0: entry.pool.token0.id,
        token1: entry.pool.token1.id,
        token0Symbol: entry.pool.token0.symbol,
        token1Symbol: entry.pool.token1.symbol,
        liquidity: Number(entry.liquidity),
        sqrtPrice: Number(entry.sqrtPrice),
        token0Price: TokenAmount.fromBigDecimal(entry.token0Price, token0),
        token1Price: TokenAmount.fromBigDecimal(entry.token1Price, token1),
        tick: Number(entry.tick),
        feeGrowthGlobal0X128: Number(entry.feeGrowthGlobal0X128),
        feeGrowthGlobal1X128: Number(entry.feeGrowthGlobal1X128),
        tvlUSD: UsdAmount.fromBigDecimal(entry.tvlUSD),
        volumeToken0: TokenAmount.fromBigDecimal(
          entry.volumeToken0,
          this.tokenService.getById(entry.pool.token0.id)!
        ),
        volumeToken1: TokenAmount.fromBigDecimal(entry.volumeToken1, token1),
        volumeUSD: UsdAmount.fromBigDecimal(entry.volumeUSD),
        feesUSD: UsdAmount.fromBigDecimal(entry.feesUSD),
        txCount: Number(entry.txCount),
        open: TokenAmount.fromBigDecimal(entry.open, token0),
        high: TokenAmount.fromBigDecimal(entry.high, token0),
        low: TokenAmount.fromBigDecimal(entry.low, token0),
        close: TokenAmount.fromBigDecimal(entry.close, token0),
      };
    });
  }
}
