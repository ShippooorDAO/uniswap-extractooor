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
  tickDayDatas: {
    id: string; // !ID
    date: string; // !Int
    pool: {
      id: string; // ID!
      token0: {
        id: string; // ID!
        name: string; // String!
      };
      token1: {
        id: string; // ID!
        name: string; // String!
      };
    }; // Pool!
    tick: {
      id: string; // !ID
    }; // Tick!
    liquidityGross: string; // !BigInt
    liquidityNet: string; // !BigInt;
    volumeToken0: string; // !BigDecimal;
    volumeToken1: string; // !BigDecimal;
    volumeUSD: string; // !BigDecimal;
    feesUSD: string; // !BigDecimal;
    feeGrowthOutside0X128: string; // !BigInt;
    feeGrowthOutside1X128: string; // !BigInt;
  }[];
}

const QUERY = gql`
  {
    tickDayDatas {
      id
      date
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
      tick {
        id
      }
      liquidityGross
      liquidityNet
      volumeToken0
      volumeToken1
      volumeUSD
      feesUSD
      feeGrowthOutside0X128
      feeGrowthOutside1X128
    }
  }
`;

export default class TickDayDatasQuery extends ExtractooorQueryBase {
  private readonly baseColumns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'date',
      headerName: 'Date',
      type: 'date',
      width: 150,
    },
    {
      field: 'dateTimestamp',
      headerName: 'Date Timestamp',
      type: 'date',
      width: 150,
    },
    {
      field: 'pool',
      headerName: 'Pool ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'poolName',
      headerName: 'Pool Name',
      type: 'string',
      width: 150,
    },
    {
      field: 'tick',
      headerName: 'Tick',
      type: 'number',
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
      field: 'feeGrowthOutside0X128',
      headerName: 'Fee Growth Outside 0 X128',
      type: 'number',
      width: 150,
    },
    {
      field: 'feeGrowthOutside1X128',
      headerName: 'Fee Growth Outside 1 X128',
      type: 'number',
      width: 150,
    },
  ];

  constructor(
    private readonly apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('TickDayData', 'TickDayData');
  }

  private parseResponse(response: Response): GridRowsProp {
    return response.tickDayDatas.map((entry) => ({
      ...entry,
      date: new Date(Number(entry.date) * 1000),
      dateTimestamp: entry.date,
      pool: entry.pool.id,
      poolName: entry.pool.token0.name.concat(' / ', entry.pool.token1.name),
      tick: entry.tick.id,
      liquidityGross: Number(entry.liquidityGross),
      liquidityNet: Number(entry.liquidityNet),
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
      feeGrowthOutside0X128: Number(entry.feeGrowthOutside0X128),
      feeGrowthOutside1X128: Number(entry.feeGrowthOutside1X128),
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
