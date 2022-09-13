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
  flashes: {
    id: string; // ID!
    transaction: {
      id: string; // ID!
    }; // Transaction!
    timestamp: string; // BigInt!
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
    sender: string; // Bytes!
    recipient: string; // Bytes!
    amount0: string; // BigDecimal!
    amount1: string; // BigDecimal!
    amountUSD: string; // BigDecimal!
    amount0Paid: string; // BigDecimal!
    amount1Paid: string; // BigDecimal!
    logIndex: string; // BigInt
  }[];
}

const QUERY = gql`
  {
    flashes {
      id
      transaction {
        id
      }
      timestamp
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
      sender
      recipient
      amount0
      amount1
      amountUSD
      amount0Paid
      amount1Paid
      logIndex
    }
  }
`;

export default class FlashesQuery extends ExtractooorQueryBase {
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
      field: 'timestamp',
      headerName: 'Timestamp',
      type: 'string',
      width: 150,
    },
    {
      field: 'date',
      headerName: 'Date',
      type: 'dateTime',
      width: 150,
    },
    {
      field: 'pool',
      headerName: 'Pool ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'sender',
      headerName: 'Sender',
      type: 'string',
      width: 150,
    },
    {
      field: 'recipient',
      headerName: 'Recipient',
      type: 'string',
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
      field: 'amount0Paid',
      headerName: 'Amount 0 Paid',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'amount1Paid',
      headerName: 'Amount 1 Paid',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
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
    super('Flashes', 'Flashes');
  }

  private parseResponse(response: Response): GridRowsProp {
    return response.flashes.map((entry) => ({
      ...entry,
      date: new Date(Number(entry.timestamp) * 1000),
      transaction: entry.transaction.id,
      pool: entry.pool.id,
      amount0: TokenAmount.fromBigDecimal(
        entry.amount0,
        this.tokenService.getById(entry.pool.token0.id)!
      ),
      amount1: TokenAmount.fromBigDecimal(
        entry.amount1,
        this.tokenService.getById(entry.pool.token1.id)!
      ),
      amountUSD: UsdAmount.fromBigDecimal(entry.amountUSD),
      amount0Paid: TokenAmount.fromBigDecimal(
        entry.amount0,
        this.tokenService.getById(entry.pool.token0.id)!
      ),
      amount1PAid: TokenAmount.fromBigDecimal(
        entry.amount1,
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
