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
      id: string;
    };
    token1: {
      id: string;
    };
  }; // Pool!
  owner: string; // Bytes!
  amount0: string; // BigDecimal!
  amount1: string; // BigDecimal!
  amountUSD: string; // BigDecimal!
  tickLower: string; // BigInt!
  tickUpper: string; // BigInt!
  logIndex: string; // BigInt!
}

interface Response {
  collects: Entity[];
}

export default class SwapsQuery extends ExtractooorQueryBase<Response, Entity> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('Collects', 'Collects', apolloClient);
  }

  getQueryEntityName() {
    return 'collects';
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
        }
        token1 {
          id
        }
      }
      owner
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
        field: 'owner',
        headerName: 'Owner',
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
        field: 'tickLower',
        headerName: 'Tick Lower',
        ...baseFields.integer,
      },
      {
        field: 'tickUpper',
        headerName: 'Tick Upper',
        ...baseFields.integer,
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
      tickLower: Number(entry.tickLower),
      tickUpper: Number(entry.tickUpper),
    }));
  }
}
