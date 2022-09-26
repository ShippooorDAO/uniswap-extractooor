/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { baseFields, ExtractooorQueryBase } from './QueryBase';
import { UsdAmount } from '@/shared/Currency/UsdAmount';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';
import { parseBigDecimalUsdAmount } from '@/shared/Utils/Subgraph';

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

interface Response {
  pools: Entity[];
}

export default class PoolsQuery extends ExtractooorQueryBase<Response, Entity> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('Pools', 'Pools', apolloClient);
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
        ...baseFields.id,
      },
      {
        field: 'createdAtTimestamp',
        headerName: 'Created At Timestamp',
        ...baseFields.timestamp,
      },
      {
        field: 'createdAtBlockNumber',
        headerName: 'Created At Block Number',
        ...baseFields.integer,
      },
      {
        field: 'token0',
        headerName: 'Token0 Symbol',
        ...baseFields.string,
      },
      {
        field: 'token1',
        headerName: 'Token1 Symbol',
        ...baseFields.string,
      },
      {
        field: 'feeTier',
        headerName: 'Fee Tier',
        ...baseFields.integer,
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
        field: 'feeGrowthGlobal0X128',
        headerName: 'Fee Growth Global 0X128',
        ...baseFields.integer,
      },
      {
        field: 'feeGrowthGlobal1X128',
        headerName: 'Fee Growth Global 1X128',
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
      { field: 'tick', headerName: 'Tick', ...baseFields.integer },
      {
        field: 'observationIndex',
        headerName: 'Observation Index',
        ...baseFields.integer,
      },
      {
        field: 'volumeToken0',
        headerName: 'Volume Token0',
        ...baseFields.amount,
      },
      {
        field: 'volumeToken1',
        headerName: 'Volume Token1',
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
        field: 'feesUSD',
        headerName: 'Fees USD',
        ...baseFields.amount,
      },
      { field: 'txCount', headerName: 'TX Count', ...baseFields.integer },
      {
        field: 'collectedFeesToken0',
        headerName: 'Collected Fees Token0',
        ...baseFields.amount,
      },
      {
        field: 'collectedFeesToken1',
        headerName: 'Collected Fees Token1',
        ...baseFields.amount,
      },
      {
        field: 'collectedFeesUSD',
        headerName: 'Collected Fees USD',
        ...baseFields.amount,
      },
      {
        field: 'totalValueLockedToken0',
        headerName: 'Total Value Locked Token0',
        ...baseFields.amount,
      },
      {
        field: 'totalValueLockedToken1',
        headerName: 'Total Value Locked Token1',
        ...baseFields.amount,
      },
      {
        field: 'totalValueLockedETH',
        headerName: 'Total Value Locked ETH',
        ...baseFields.amount,
      },
      {
        field: 'totalValueLockedUSD',
        headerName: 'Total Value Locked USD',
        ...baseFields.amount,
      },
      {
        field: 'totalValueLockedUSDUntracked',
        headerName: 'Total Value Locked USD Untracked',
        ...baseFields.amount,
      },
      {
        field: 'liquidityProviderCount',
        headerName: 'Liquidity Provider Count',
        ...baseFields.integer,
      },
    ];
  }

  getRows(response: Entity[]): GridRowsProp {
    return response.map((entry) => ({
      ...entry,
      createdAtDate: new Date(Number(entry.createdAtTimestamp) * 1000),
      token0: entry.token0.symbol,
      token1: entry.token1.symbol,
      feeTier: Number(entry.feeTier),
      liquidity: Number(entry.liquidity),
      sqrtPrice: Number(entry.sqrtPrice),
      feeGrowthGlobal0X128: Number(entry.feeGrowthGlobal0X128),
      feeGrowthGlobal1X128: Number(entry.feeGrowthGlobal1X128),
      token0Price: UsdAmount.fromBigDecimal(entry.token0Price),
      token1Price: UsdAmount.fromBigDecimal(entry.token1Price),
      tick: Number(entry.tick),
      observationIndex: Number(entry.observationIndex),
      volumeToken0: TokenAmount.fromBigDecimal(
        entry.volumeToken0,
        this.tokenService.getById(entry.token0.id)!
      ),
      volumeToken1: TokenAmount.fromBigDecimal(
        entry.volumeToken1,
        this.tokenService.getById(entry.token1.id)!
      ),
      volumeUSD: UsdAmount.fromBigDecimal(entry.volumeUSD),
      untrackedVolumeUSD: UsdAmount.fromBigDecimal(entry.untrackedVolumeUSD),
      feesUSD: UsdAmount.fromBigDecimal(entry.feesUSD),
      txCount: Number(entry.txCount),
      collectedFeesToken0: TokenAmount.fromBigDecimal(
        entry.collectedFeesToken0,
        this.tokenService.getById(entry.token0.id)!
      ),
      collectedFeesToken1: TokenAmount.fromBigDecimal(
        entry.collectedFeesToken1,
        this.tokenService.getById(entry.token1.id)!
      ),
      collectedFeesUSD: UsdAmount.fromBigDecimal(entry.collectedFeesUSD),
      totalValueLockedToken0: TokenAmount.fromBigDecimal(
        entry.totalValueLockedToken0,
        this.tokenService.getById(entry.token0.id)!
      ),
      totalValueLockedToken1: TokenAmount.fromBigDecimal(
        entry.totalValueLockedToken1,
        this.tokenService.getById(entry.token1.id)!
      ),
      totalValueLockedETH: TokenAmount.fromBigDecimal(
        entry.totalValueLockedETH,
        this.tokenService.getBySymbol('ETH')!
      ),
      totalValueLockedUSD: UsdAmount.fromBigDecimal(entry.totalValueLockedUSD),
      totalValueLockedUSDUntracked: UsdAmount.fromBigDecimal(
        entry.totalValueLockedUSDUntracked
      ),
      liquidityProviderCount: Number(entry.liquidityProviderCount),
    }));
  }
}
