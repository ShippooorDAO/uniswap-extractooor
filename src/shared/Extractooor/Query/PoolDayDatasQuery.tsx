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
  poolDayDatas: {
    id: string; // ID!
    pool: {
      id: string; // ID!
      token0: {
        id: string; // ID!
        name: string; // String!
      }; // Token!
      token1: {
        id: string; // ID!
        name: string; // String!
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
  }[];
}

const QUERY = gql`
  {
    poolDayDatas {
      id
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
    }
  }
`;

export default class PoolDayDatasQuery extends ExtractooorQueryBase {
  private readonly baseColumns: GridColDef[] = [
    { field: 'pool', headerName: 'Pool ID', type: 'string', width: 150 },
    { field: 'token0', headerName: 'Token 0 Name', type: 'string', width: 150 },
    { field: 'token1', headerName: 'Token 1 Name', type: 'string', width: 150 },
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
    {
      field: 'tick',
      headerName: 'Tick',
      type: 'number',
      width: 150,
    },
    {
      field: 'feeGrowthGlobal0X128',
      headerName: 'Fee Growth Global 0 X128',
      type: 'number',
      width: 150,
    },
    {
      field: 'feeGrowthGlobal1X128',
      headerName: 'Fee Growth Global 1 X128',
      type: 'number',
      width: 150,
    },
    {
      field: 'tvlUSD',
      headerName: 'TVL USD',
      type: 'number',
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
      field: 'feesUSD',
      headerName: 'Fees USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'txCount',
      headerName: 'TX Count',
      type: 'number',
      width: 150,
    },
    {
      field: 'open',
      headerName: 'Open',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'high',
      headerName: 'High',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'low',
      headerName: 'Low',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'close',
      headerName: 'Close',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
  ];

  constructor(
    private readonly apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('PoolDayDatas', 'PoolDayDatas');
  }

  private parseResponse(response: Response): GridRowsProp {
    return response.poolDayDatas.map((entry) => ({
      ...entry,
      pool: entry.pool.id,
      token0: entry.pool.token0.name,
      token1: entry.pool.token1.name,
      liquidity: Number(entry.liquidity),
      sqrtPrice: Number(entry.sqrtPrice),
      token0Price: Number(entry.token0Price),
      token1Price: Number(entry.token1Price),
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
