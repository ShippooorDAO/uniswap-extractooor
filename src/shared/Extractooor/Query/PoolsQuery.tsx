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
  pools: {
    id: string; // ID!
    createdAtTimestamp: string; // BigInt!
    createdAtBlockNumber: string; // BigInt!
    token0: { id: string; name: string }; // Token!
    token1: { id: string; name: string }; // Token!
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
  }[];
}

const QUERY = gql`
  {
    pools {
      id
      createdAtTimestamp
      createdAtBlockNumber
      token0 {
        id
        name
      }
      token1 {
        id
        name
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
    }
  }
`;

export default class PoolsQuery extends ExtractooorQueryBase {
  private readonly baseColumns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'createdAtTimestamp',
      headerName: 'Created At Timestamp',
      type: 'string',
      width: 150,
    },
    {
      field: 'createdAtDate',
      headerName: 'Created At Date',
      type: 'dateTime',
      width: 150,
    },
    {
      field: 'createdAtBlockNumber',
      headerName: 'Created At Block Number',
      type: 'string',
      width: 150,
    },
    { field: 'token0', headerName: 'Token0 Name', type: 'string', width: 150 },
    { field: 'token1', headerName: 'Token1 Name', type: 'string', width: 150 },
    {
      field: 'feeTier',
      headerName: 'Fee Tier',
      type: 'number',
      width: 150,
    },
    {
      field: 'liquidity',
      headerName: 'Liquidity',
      type: 'number',
      width: 150,
    },
    {
      field: 'sqrtPrice',
      headerName: 'Sqrt Price',
      type: 'number',
      width: 150,
    },
    {
      field: 'feeGrowthGlobal0X128',
      headerName: 'Fee Growth Global 0X128',
      type: 'number',
      width: 150,
    },
    {
      field: 'feeGrowthGlobal1X128',
      headerName: 'Fee Growth Global 1X128',
      type: 'number',
      width: 150,
    },
    {
      field: 'token0Price',
      headerName: 'Token0 Price',
      type: 'number',
      width: 150,
    },
    {
      field: 'token1Price',
      headerName: 'Token1 Price',
      type: 'number',
      width: 150,
    },
    { field: 'tick', headerName: 'Tick', type: 'number', width: 150 },
    {
      field: 'observationIndex',
      headerName: 'Observation Index',
      type: 'number',
      width: 150,
    },
    {
      field: 'volumeToken0',
      headerName: 'Volume Token0',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'volumeToken1',
      headerName: 'Volume Token1',
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
      field: 'feesUSD',
      headerName: 'Fees USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    { field: 'txCount', headerName: 'TX Count', type: 'number', width: 150 },
    {
      field: 'collectedFeesToken0',
      headerName: 'Collected Fees Token0',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'collectedFeesToken1',
      headerName: 'Collected Fees Token1',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'collectedFeesUSD',
      headerName: 'Collected Fees USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'totalValueLockedToken0',
      headerName: 'Total Value Locked Token0',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'totalValueLockedToken1',
      headerName: 'Total Value Locked Token1',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'totalValueLockedETH',
      headerName: 'Total Value Locked ETH',
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
      field: 'totalValueLockedUSDUntracked',
      headerName: 'Total Value Locked USD Untracked',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'liquidityProviderCount',
      headerName: 'Liquidity Provider Count',
      type: 'number',
      width: 150,
    },
  ];

  constructor(
    private readonly apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('Pools', 'Pools');
  }

  private parseResponse(response: Response): GridRowsProp {
    return response.pools.map((entry) => ({
      ...entry,
      createdAtDate: new Date(Number(entry.createdAtTimestamp) * 1000),
      token0: entry.token0.name,
      token1: entry.token1.name,
      feeTier: Number(entry.feeTier),
      liquidity: Number(entry.liquidity),
      sqrtPrice: Number(entry.sqrtPrice),
      feeGrowthGlobal0X128: Number(entry.feeGrowthGlobal0X128),
      feeGrowthGlobal1X128: Number(entry.feeGrowthGlobal1X128),
      token0Price: Number(entry.token0Price),
      token1Price: Number(entry.token1Price),
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
