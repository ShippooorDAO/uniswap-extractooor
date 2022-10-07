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
  createdAtTimestamp: string; // BigInt!
  createdAtBlockNumber: string; // BigInt!
  token0: { id: string; symbol: string }; // Token!
  token1: { id: string; symbol: string }; // Token!
  feeTier: string; // BigInt!
  liquidity: string; // BigInt!
  sqrtPrice: string; // BigInt!
  feeGrowthGlobal0X128: string; // BigInt!
  feeGrowthGlobal1X128: string; // BigInt!
  token0Price: string; // BigDecimal!
  token1Price: string; // BigDecimal!
  tick: string; // BigInt
  observationIndex: string; // BigInt!
  volumeToken0: string; // BigDecimal!
  volumeToken1: string; // BigDecimal!
  volumeUSD: string; // BigDecimal!
  untrackedVolumeUSD: string; // BigDecimal!
  feesUSD: string; // BigDecimal!
  txCount: string; // BigInt!
  collectedFeesToken0: string; // BigDecimal!
  collectedFeesToken1: string; // BigDecimal!
  collectedFeesUSD: string; // BigDecimal!
  totalValueLockedToken0: string; // BigDecimal!
  totalValueLockedToken1: string; // BigDecimal!
  totalValueLockedETH: string; // BigDecimal!
  totalValueLockedUSD: string; // BigDecimal!
  totalValueLockedUSDUntracked: string; // BigDecimal!
  liquidityProviderCount: string; // BigInt!

  /// Ignored fields:
  // poolHourData: string; //  [PoolHourData!]!
  // poolDayData: string; //  [PoolDayData!]!
  // mints: string; //  [Mint!]!
  // burns: string; //  [Burn!]!
  // swaps: string; //  [Swap!]!
  // collects: string; //  [Collect!]!
  // ticks: string; //  [Tick!]!
}

export default class PoolsQuery extends ExtractooorQueryBase<Entity> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    tokenService: TokenService,
    uniswapPoolService: UniswapPoolService
  ) {
    super('Pools', 'Pools', apolloClient, tokenService, uniswapPoolService);
  }

  protected getQueryEntityName(): string {
    return 'pools';
  }

  getQueryBody() {
    return `
    {
      id
      createdAtTimestamp
      createdAtBlockNumber
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      feeTier
      liquidity
      sqrtPrice
      feeGrowthGlobal0X128
      feeGrowthGlobal1X128
      token0Price
      token1Price
      tick
      observationIndex
      volumeToken0
      volumeToken1
      volumeUSD
      untrackedVolumeUSD
      feesUSD
      txCount
      collectedFeesToken0
      collectedFeesToken1
      collectedFeesUSD
      totalValueLockedToken0
      totalValueLockedToken1
      totalValueLockedETH
      totalValueLockedUSD
      totalValueLockedUSDUntracked
      liquidityProviderCount
    }`;
  }

  getColumns(): GridColDef[] {
    return [
      {
        field: 'id',
        headerName: 'ID',
        ...this.baseFields.poolId,
      },
      {
        field: 'createdAtTimestamp',
        headerName: 'Created At Timestamp',
        ...this.baseFields.timestamp,
      },
      {
        field: 'createdAtBlockNumber',
        headerName: 'Created At Block Number',
        ...this.baseFields.integer,
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
        field: 'token0',
        headerName: 'Token 0',
        ...this.baseFields.token,
      },
      {
        field: 'token1',
        headerName: 'Token 1',
        ...this.baseFields.token,
      },
      {
        field: 'feeTier',
        headerName: 'Fee Tier',
        ...this.baseFields.integer,
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
        field: 'feeGrowthGlobal0X128',
        headerName: 'Fee Growth Global 0X128',
        ...this.baseFields.integer,
      },
      {
        field: 'feeGrowthGlobal1X128',
        headerName: 'Fee Growth Global 1X128',
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
      { field: 'tick', headerName: 'Tick', ...this.baseFields.integer },
      {
        field: 'observationIndex',
        headerName: 'Observation Index',
        ...this.baseFields.integer,
      },
      {
        field: 'volumeToken0',
        headerName: 'Volume Token0',
        ...this.baseFields.amount,
      },
      {
        field: 'volumeToken1',
        headerName: 'Volume Token1',
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
        field: 'feesUSD',
        headerName: 'Fees USD',
        ...this.baseFields.amount,
      },
      { field: 'txCount', headerName: 'TX Count', ...this.baseFields.integer },
      {
        field: 'collectedFeesToken0',
        headerName: 'Collected Fees Token0',
        ...this.baseFields.amount,
      },
      {
        field: 'collectedFeesToken1',
        headerName: 'Collected Fees Token1',
        ...this.baseFields.amount,
      },
      {
        field: 'collectedFeesUSD',
        headerName: 'Collected Fees USD',
        ...this.baseFields.amount,
      },
      {
        field: 'totalValueLockedToken0',
        headerName: 'Total Value Locked Token0',
        ...this.baseFields.amount,
      },
      {
        field: 'totalValueLockedToken1',
        headerName: 'Total Value Locked Token1',
        ...this.baseFields.amount,
      },
      {
        field: 'totalValueLockedETH',
        headerName: 'Total Value Locked ETH',
        ...this.baseFields.amount,
      },
      {
        field: 'totalValueLockedUSD',
        headerName: 'Total Value Locked USD',
        ...this.baseFields.amount,
      },
      {
        field: 'totalValueLockedUSDUntracked',
        headerName: 'Total Value Locked USD Untracked',
        ...this.baseFields.amount,
      },
      {
        field: 'liquidityProviderCount',
        headerName: 'Liquidity Provider Count',
        ...this.baseFields.integer,
      },
    ];
  }

  getRows(response: Entity[]): GridRowsProp {
    return response.map((entry) => {
      const token0 = this.tokenService.getById(entry.token0.id)!;
      const token1 = this.tokenService.getById(entry.token1.id)!;
      return {
        ...entry,
        createdAtTimestamp: new Date(Number(entry.createdAtTimestamp) * 1000),
        token0: entry.token0.id,
        token1: entry.token1.id,
        token0Symbol: entry.token0.symbol,
        token1Symbol: entry.token1.symbol,
        feeTier: Number(entry.feeTier) / 1000000,
        liquidity: Number(entry.liquidity),
        sqrtPrice: Number(entry.sqrtPrice),
        feeGrowthGlobal0X128: Number(entry.feeGrowthGlobal0X128),
        feeGrowthGlobal1X128: Number(entry.feeGrowthGlobal1X128),
        token0Price: TokenAmount.fromBigDecimal(entry.token0Price, token0),
        token1Price: TokenAmount.fromBigDecimal(entry.token1Price, token1),
        tick: Number(entry.tick),
        observationIndex: Number(entry.observationIndex),
        volumeToken0: TokenAmount.fromBigDecimal(entry.volumeToken0, token0),
        volumeToken1: TokenAmount.fromBigDecimal(entry.volumeToken1, token1),
        volumeUSD: UsdAmount.fromBigDecimal(entry.volumeUSD),
        untrackedVolumeUSD: UsdAmount.fromBigDecimal(entry.untrackedVolumeUSD),
        feesUSD: UsdAmount.fromBigDecimal(entry.feesUSD),
        txCount: Number(entry.txCount),
        collectedFeesToken0: TokenAmount.fromBigDecimal(
          entry.collectedFeesToken0,
          token0
        ),
        collectedFeesToken1: TokenAmount.fromBigDecimal(
          entry.collectedFeesToken1,
          token1
        ),
        collectedFeesUSD: UsdAmount.fromBigDecimal(entry.collectedFeesUSD),
        totalValueLockedToken0: TokenAmount.fromBigDecimal(
          entry.totalValueLockedToken0,
          token0
        ),
        totalValueLockedToken1: TokenAmount.fromBigDecimal(
          entry.totalValueLockedToken1,
          token1
        ),
        totalValueLockedETH: TokenAmount.fromBigDecimal(
          entry.totalValueLockedETH,
          this.tokenService.getBySymbol('ETH')!
        ),
        totalValueLockedUSD: UsdAmount.fromBigDecimal(
          entry.totalValueLockedUSD
        ),
        totalValueLockedUSDUntracked: UsdAmount.fromBigDecimal(
          entry.totalValueLockedUSDUntracked
        ),
        liquidityProviderCount: Number(entry.liquidityProviderCount),
      };
    });
  }
}
