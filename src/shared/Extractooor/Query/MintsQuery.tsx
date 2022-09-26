/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ExtractooorQueryBase } from './QueryBase';
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
  }; // Pool!
  token0: {
    id: string; // ID!
    symbol: string; // String!
  }; // Token!
  token1: {
    id: string; // ID!
    symbol: string; // String!
  }; // Token!
  owner: string; // Bytes!
  sender: string; // Bytes
  origin: string; // Bytes!
  amount: string; // BigInt!
  amount0: string; // BigDecimal!
  amount1: string; // BigDecimal!
  amountUSD: string; // BigDecimal
  tickLower: string; // BigInt!
  tickUpper: string; // BigInt!
  logIndex: string; // BigInt
}

interface Response {
  mints: Entity[];
}

export default class MintsQuery extends ExtractooorQueryBase<Response, Entity> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    tokenService: TokenService
  ) {
    super('Mints', 'Mints', apolloClient, tokenService);
  }

  getQueryEntityName() {
    return 'mints';
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
      }
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      owner
      sender
      origin
      amount
      amount0
      amount1
      amountUSD
      tickLower
      tickUpper
      logIndex
    }`;
  }

  getColumns(): GridColDef[] {
    return [
      {
        field: 'id',
        headerName: 'ID',
        ...this.baseFields.id,
      },
      {
        field: 'transaction',
        headerName: 'Transaction ID',
        ...this.baseFields.string,
      },
      {
        field: 'timestamp',
        headerName: 'Timestamp',
        ...this.baseFields.timestamp,
      },
      {
        field: 'pool',
        headerName: 'Pool ID',
        ...this.baseFields.string,
      },
      {
        field: 'token0',
        headerName: 'Token 0 ID',
        ...this.baseFields.string,
      },
      {
        field: 'token0Symbol',
        headerName: 'Token 0 Symbol',
        ...this.baseFields.string,
      },
      {
        field: 'token1',
        headerName: 'Token 1 ID',
        ...this.baseFields.string,
      },
      {
        field: 'token1Symbol',
        headerName: 'Token 1 Symbol',
        ...this.baseFields.string,
      },
      {
        field: 'sender',
        headerName: 'Sender',
        ...this.baseFields.string,
      },
      {
        field: 'origin',
        headerName: 'Origin',
        ...this.baseFields.string,
      },
      {
        field: 'amount',
        headerName: 'Amount',
        ...this.baseFields.integer,
      },
      {
        field: 'amount0',
        headerName: 'Amount 0',
        ...this.baseFields.amount,
      },
      {
        field: 'amount1',
        headerName: 'Amount 1',
        ...this.baseFields.amount,
      },
      {
        field: 'amountUSD',
        headerName: 'Amount USD',
        ...this.baseFields.amount,
      },
      {
        field: 'tickLower',
        headerName: 'Tick Lower',
        ...this.baseFields.integer,
      },
      {
        field: 'tickUpper',
        headerName: 'Tick Upper',
        ...this.baseFields.integer,
      },
      {
        field: 'logIndex',
        headerName: 'Log Index',
        ...this.baseFields.integer,
      },
    ];
  }

  getRows(response: Entity[]): GridRowsProp {
    return response.map((entry) => ({
      ...entry,
      timestamp: new Date(Number(entry.timestamp) * 1000),
      transaction: entry.transaction.id,
      pool: entry.pool.id,
      token0: entry.token0.id,
      token0Symbol: entry.token0.symbol,
      token1: entry.token1.id,
      token1Symbol: entry.token1.symbol,
      amount: entry.amount,
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
}
