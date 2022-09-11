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
  tickHourDatas: {
    id: string; // ID!
    periodStartUnix: string; // Int!
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
      id: string; // ID!
    }; // Tick!
    liquidityGross: string; // BigInt!
    liquidityNet: string; // BigInt!
    volumeToken0: string; // BigDecimal!
    volumeToken1: string; // BigDecimal!
    volumeUSD: string; // BigDecimal!
    feesUSD: string; // BigDecimal!
  }[];
}

const QUERY = gql`
  {
    tickHourDatas {
      id
      periodStartUnix
      pool
      tick
      liquidityGross
      liquidityNet
      volumeToken0
      volumeToken1
      volumeUSD
      feesUSD
    }
  }
`;

export default class TickHourDatasQuery extends ExtractooorQueryBase {
  private readonly baseColumns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'periodStartUnix',
      headerName: 'Period Start Unix Timestamp',
      type: 'string',
      width: 150,
    },
    {
      field: 'periodStartUnixDate',
      headerName: 'Period Start Unix Date',
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
  ];

  constructor(
    private readonly apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('TickHourData', 'TickHourData');
  }

  private parseResponse(response: Response): GridRowsProp {
    return response.tickHourDatas.map((entry) => ({
      ...entry,
      periodStartUnixDate: new Date(Number(entry.periodStartUnix) * 1000),
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
