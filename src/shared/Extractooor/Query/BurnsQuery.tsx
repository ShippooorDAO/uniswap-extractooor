/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import { ReactNode } from 'react';
import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { ExtractooorQueryBase } from './QueryBase';
import { AmountFormatter } from '@/shared/Utils/DataGrid';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';
import { UsdAmount } from '@/shared/Currency/UsdAmount';

interface Response {
  burns: {
    id: string; // ID!
    transaction: {
      id: string; // ID!
    }; // Transaction!
    pool: {
      id: string; // ID!
    }; // Pool!
    token0: {
      id: string;
      name: string;
    }; // Token!
    token1: {
      id: string;
      name: string;
    }; // Token!
    timestamp: string;
    owner: string; // Bytes!
    origin: string; // Bytes!
    amount: string; // BigInt!
    amount0: string; // BigDecimal!
    amount1: string; // BigDecimal!
    amountUSD: string; // BigDecimal
    tickLower: string; // BigInt!
    tickUpper: string; // BigInt!
    logIndex: string; // BigInt
  }[];
}

const QUERY = gql`
  {
    burns {
      id
      transaction {
        id
      }
      pool {
        id
      }
      token0 {
        id
        name
      }
      token1 {
        id
        name
      }
      timestamp
      owner
      origin
      amount
      amount0
      amount1
      amountUSD
      tickLower
      tickUpper
      logIndex
    }
  }
`;

export default class BurnsQuery extends ExtractooorQueryBase {
  private readonly baseColumns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'transaction',
      headerName: 'Transaction ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'pool',
      headerName: 'Pool ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'token0',
      headerName: 'Token 0 ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'token0Name',
      headerName: 'Token 0 Name',
      type: 'string',
      width: 150,
    },
    {
      field: 'token1',
      headerName: 'Token 1 ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'token1Name',
      headerName: 'Token 1 Name',
      type: 'string',
      width: 150,
    },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      type: 'string',
      width: 150,
    },
    {
      field: 'owner',
      headerName: 'Owner',
      type: 'string',
      width: 150,
    },
    {
      field: 'origin',
      headerName: 'Origin',
      type: 'string',
      width: 150,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      type: 'number',
      width: 150,
    },
    {
      field: 'amount0',
      headerName: 'Amount 0',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'amount1',
      headerName: 'Amount 1',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'amountUSD',
      headerName: 'Amount USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'tickLower',
      headerName: 'Tick Lower',
      type: 'number',
      width: 150,
    },
    {
      field: 'tickUpper',
      headerName: 'Tick Upper',
      type: 'number',
      width: 150,
    },
    {
      field: 'logIndex',
      headerName: 'Log Index',
      type: 'string',
      width: 150,
    },
  ];

  constructor(
    private readonly apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('Burns', 'Burns');
  }

  private parseResponse(response: Response): GridRowsProp {
    return response.burns.map((entry) => ({
      ...entry,
      transaction: entry.transaction.id,
      pool: entry.pool.id,
      token0: entry.token0.id,
      token0Name: entry.token0.name,
      token1: entry.token1.id,
      token1Name: entry.token1.name,
      amount: Number(entry.amount),
      amount0: TokenAmount.fromBigDecimal(
        entry.amount0,
        this.tokenService.getById(entry.token0.id)!
      ),
      amount1: TokenAmount.fromBigDecimal(
        entry.amount1,
        this.tokenService.getById(entry.token1.id)!
      ),
      amountUSD: UsdAmount.fromBigDecimal(entry.amountUSD),
      tickLower: Number(entry.tickLower),
      tickUpper: Number(entry.tickUpper),
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
