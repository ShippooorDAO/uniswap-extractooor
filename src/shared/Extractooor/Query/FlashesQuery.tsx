/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { baseFields, ExtractooorQueryBase } from './QueryBase';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';
import { UsdAmount } from '@/shared/Currency/UsdAmount';

interface Entity {
  id: string; // ID!
  transaction: {
    id: string; // ID!
  }; // Transaction!
  timestamp: string; // BigInt!
  pool: {
    id: string; // ID!
    token0: {
      id: string; // ID!
      symbol: string; // String!
    };
    token1: {
      id: string; // ID!
      symbol: string; // String!
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
}

interface Response {
  flashes: Entity[];
}

export default class FlashesQuery extends ExtractooorQueryBase<
  Response,
  Entity
> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('Flashes', 'Flashes', apolloClient);
  }

  getQueryEntityName() {
    return 'flashes';
  }

  getQueryBody() {
    return `{
      id
      transaction {
        id
      }
      timestamp
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
      sender
      recipient
      amount0
      amount1
      amountUSD
      amount0Paid
      amount1Paid
      logIndex
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
        field: 'transaction',
        headerName: 'Transaction ID',
        ...baseFields.string,
      },
      {
        field: 'timestamp',
        headerName: 'Timestamp',
        ...baseFields.timestamp,
      },
      {
        field: 'pool',
        headerName: 'Pool ID',
        ...baseFields.string,
      },
      {
        field: 'sender',
        headerName: 'Sender',
        ...baseFields.string,
      },
      {
        field: 'recipient',
        headerName: 'Recipient',
        ...baseFields.string,
      },
      {
        field: 'amount0',
        headerName: 'Amount 0',
        ...baseFields.amount,
      },
      {
        field: 'amount1',
        headerName: 'Amount 1',
        ...baseFields.amount,
      },
      {
        field: 'amountUSD',
        headerName: 'Amount USD',
        ...baseFields.amount,
      },
      {
        field: 'amount0Paid',
        headerName: 'Amount 0 Paid',
        ...baseFields.amount,
      },
      {
        field: 'amount1Paid',
        headerName: 'Amount 1 Paid',
        ...baseFields.amount,
      },
      {
        field: 'logIndex',
        headerName: 'Log Index',
        ...baseFields.integer,
      },
    ];
  }

  getRows(response: Entity[]): GridRowsProp {
    return response.map((entry) => ({
      ...entry,
      timestamp: new Date(Number(entry.timestamp) * 1000),
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
      amount1Paid: TokenAmount.fromBigDecimal(
        entry.amount1,
        this.tokenService.getById(entry.pool.token1.id)!
      ),
    }));
  }
}
