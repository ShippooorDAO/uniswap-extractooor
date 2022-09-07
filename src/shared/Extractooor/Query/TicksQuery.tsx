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
  ticks: {
    id: string; // ID!
    poolAddress: string; // String
    tickIdx: string; // BigInt!
    pool: {
      id: string;
      token0: {
        id: string;
        name: string;
      };
      token1: {
        id: string;
        name: string;
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
  }[];
}

const QUERY = gql`
  {
    ticks {
      id
      poolAddress
      tickIdx
      pool {
        id
        token0 {
          id
          name
        }
        token1 {
          id
          name
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
    }
  }
`;

export default class TicksQuery extends ExtractooorQueryBase {
  private readonly baseColumns: GridColDef[] = [
    {
      field: 'poolAddress',
      headerName: 'Pool Address',
      type: 'string',
      width: 150,
    },
    {
      field: 'tickIdx',
      headerName: 'Tick Idx',
      type: 'string',
      width: 150,
    },
    {
      field: 'pool',
      headerName: 'Pool Name',
      type: 'string',
      width: 150,
    },
    {
      field: 'liquidityGross',
      headerName: 'Liquidity Gross',
      type: 'number',
      width: 150,
    },
    {
      field: 'liquidityNet',
      headerName: 'Liquidity Net',
      type: 'number',
      width: 150,
    },
    {
      field: 'price0',
      headerName: 'Price 0',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'price1',
      headerName: 'Price 1',
      type: '',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'volumeToken0',
      headerName: 'Volume Token 0',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'volumeToken1',
      headerName: 'Volume Token 1',
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
    {
      field: 'collectedFeesToken0',
      headerName: 'Collected Fees Token 0',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'collectedFeesToken1',
      headerName: 'Collected Fees Token 1',
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
      field: 'createdAtTimestamp',
      headerName: 'Created At Timestamp',
      type: 'string',
      width: 150,
    },
    {
      field: 'createdAtBlockNumber',
      headerName: 'Created At Block Number',
      type: 'string',
      width: 150,
    },
    {
      field: 'liquidityProviderCount',
      headerName: 'Liquidity Provider Count',
      type: 'number',
      width: 150,
    },
    {
      field: 'feeGrowthOutside0X128',
      headerName: 'Fee Growth Outside 0X128',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'feeGrowthOutside1X128',
      headerName: 'Fee Growth Outside 1X128',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
  ];

  constructor(
    private readonly apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('Ticks', 'Ticks');
  }

  private parseResponse(response: Response): GridRowsProp {
    return response.ticks.map((entry) => ({
      ...entry,
      // poolAddress: string,
      // tickIdx: entry.tickIdx,
      pool: entry.pool.token0.name.concat(' / ', entry.pool.token1.name),
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
      // createdAtTimestamp: entry.createdAtTimestamp,
      // createdAtBlockNumber: entry.createdAtBlockNumber,
      liquidityProviderCount: Number(entry.liquidityProviderCount),
      feeGrowthOutside0X128: TokenAmount.fromBigDecimal(
        entry.collectedFeesToken0,
        this.tokenService.getById(entry.pool.token0.id)!
      ),
      feeGrowthOutside1X128: TokenAmount.fromBigDecimal(
        entry.collectedFeesToken1,
        this.tokenService.getById(entry.pool.token1.id)!
      ),
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
