/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { baseFields, ExtractooorQueryBase } from './QueryBase';
import { UsdAmount } from '@/shared/Currency/UsdAmount';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';

interface Entity {
  id: string; // ID!
  poolAddress: string; // String
  tickIdx: string; // BigInt!
  pool: {
    id: string;
    token0: {
      id: string;
      symbol: string;
    };
    token1: {
      id: string;
      symbol: string;
    };
  }; // Pool!
  liquidityGross: string; // BigInt!
  liquidityNet: string; // BigInt!
  price0: string; // BigDecimal!
  price1: string; // BigDecimal!
  volumeToken0: string; // BigDecimal!
  volumeToken1: string; // BigDecimal!
  volumeUSD: string; // BigDecimal!
  untrackedVolumeUSD: string; // BigDecimal!
  feesUSD: string; // BigDecimal!
  collectedFeesToken0: string; // BigDecimal!
  collectedFeesToken1: string; // BigDecimal!
  collectedFeesUSD: string; // BigDecimal!
  createdAtTimestamp: string; // BigInt!
  createdAtBlockNumber: string; // BigInt!
  liquidityProviderCount: string; // BigInt!
  feeGrowthOutside0X128: string; // BigInt!
  feeGrowthOutside1X128: string; // BigInt!
}

interface Response {
  ticks: Entity[];
}

export default class TicksQuery extends ExtractooorQueryBase<Response, Entity> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('Ticks', 'Ticks', apolloClient);
  }

  getQueryEntityName() {
    return 'ticks';
  }

  getQueryBody() {
    return `{
      id
      poolAddress
      tickIdx
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
      liquidityGross
      liquidityNet
      price0
      price1
      volumeToken0
      volumeToken1
      volumeUSD
      untrackedVolumeUSD
      feesUSD
      collectedFeesToken0
      collectedFeesToken1
      collectedFeesUSD
      createdAtTimestamp
      createdAtBlockNumber
      liquidityProviderCount
      feeGrowthOutside0X128
      feeGrowthOutside1X128
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
        field: 'poolAddress',
        headerName: 'Pool Address',
        ...baseFields.string,
      },
      {
        field: 'tickIdx',
        headerName: 'Tick Idx',
        ...baseFields.string,
      },
      {
        field: 'pool',
        headerName: 'Pool Name',
        ...baseFields.string,
      },
      {
        field: 'liquidityGross',
        headerName: 'Liquidity Gross',
        ...baseFields.integer,
      },
      {
        field: 'liquidityNet',
        headerName: 'Liquidity Net',
        ...baseFields.integer,
      },
      {
        field: 'price0',
        headerName: 'Price 0',
        ...baseFields.amount,
      },
      {
        field: 'price1',
        headerName: 'Price 1',
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
        field: 'untrackedVolumeUSD',
        headerName: 'Untracked Volume USD',
        ...baseFields.amount,
      },
      {
        field: 'feesUSD',
        headerName: 'Fees USD',
        ...baseFields.amount,
      },
      {
        field: 'collectedFeesToken0',
        headerName: 'Collected Fees Token 0',
        ...baseFields.amount,
      },
      {
        field: 'collectedFeesToken1',
        headerName: 'Collected Fees Token 1',
        ...baseFields.amount,
      },
      {
        field: 'collectedFeesUSD',
        headerName: 'Collected Fees USD',
        ...baseFields.amount,
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
        field: 'liquidityProviderCount',
        headerName: 'Liquidity Provider Count',
        ...baseFields.integer,
      },
      {
        field: 'feeGrowthOutside0X128',
        headerName: 'Fee Growth Outside 0 X128',
        ...baseFields.integer,
      },
      {
        field: 'feeGrowthOutside1X128',
        headerName: 'Fee Growth Outside 1 X128',
        ...baseFields.integer,
      },
    ];
  }

  getRows(response: Entity[]): GridRowsProp {
    return response.map((entry) => ({
      ...entry,
      // poolAddress: string,
      // tickIdx: entry.tickIdx,
      pool: entry.pool.token0.symbol.concat(' / ', entry.pool.token1.symbol),
      liquidityGross: Number(entry.liquidityGross),
      liquidityNet: Number(entry.liquidityNet),
      price0: TokenAmount.fromBigDecimal(
        entry.price0,
        this.tokenService.getById(entry.pool.token0.id)!
      ),
      price1: TokenAmount.fromBigDecimal(
        entry.price1,
        this.tokenService.getById(entry.pool.token1.id)!
      ),
      volumeToken0: TokenAmount.fromBigDecimal(
        entry.volumeToken0,
        this.tokenService.getById(entry.pool.token0.id)!
      ),
      volumeToken1: TokenAmount.fromBigDecimal(
        entry.volumeToken1,
        this.tokenService.getById(entry.pool.token1.id)!
      ),
      volumeUSD: UsdAmount.fromBigDecimal(entry.volumeUSD),
      untrackedVolumeUSD: UsdAmount.fromBigDecimal(entry.untrackedVolumeUSD),
      feesUSD: UsdAmount.fromBigDecimal(entry.feesUSD),
      collectedFeesToken0: TokenAmount.fromBigDecimal(
        entry.collectedFeesToken0,
        this.tokenService.getById(entry.pool.token0.id)!
      ),
      collectedFeesToken1: TokenAmount.fromBigDecimal(
        entry.collectedFeesToken1,
        this.tokenService.getById(entry.pool.token1.id)!
      ),
      collectedFeesUSD: UsdAmount.fromBigDecimal(entry.collectedFeesUSD),
      createdAtTimestamp: new Date(Number(entry.createdAtTimestamp) * 1000),
      liquidityProviderCount: Number(entry.liquidityProviderCount),
      feeGrowthOutside0X128: Number(entry.feeGrowthOutside0X128),
      feeGrowthOutside1X128: Number(entry.feeGrowthOutside1X128),
    }));
  }
}
