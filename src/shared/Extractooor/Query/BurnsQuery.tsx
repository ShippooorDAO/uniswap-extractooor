/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-premium';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ExtractooorQueryBase } from './QueryBase';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';
import { UsdAmount } from '@/shared/Currency/UsdAmount';
import { UniswapPoolService } from '@/shared/UniswapPool/UniswapPoolService';

interface Entity {
  id: string; // ID!
  transaction: {
    id: string; // ID!
  }; // Transaction!
  pool: {
    id: string; // ID!
  }; // Pool!
  token0: {
    id: string;
    symbol: string;
  }; // Token!
  token1: {
    id: string;
    symbol: string;
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
}

export default class BurnsQuery extends ExtractooorQueryBase<Entity> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    tokenService: TokenService,
    uniswapPoolService: UniswapPoolService
  ) {
    super('Burns', 'Burns', apolloClient, tokenService, uniswapPoolService);
  }

  getQueryEntityName() {
    return 'burns';
  }

  getQueryBody() {
    return `{
      id
      transaction {
        id
      }
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
    }`;
  }

  getColumns(): GridColDef[] {
    return [
      {
        field: 'id',
        headerName: 'ID',
        ...this.baseFields.transactionId,
      },
      {
        field: 'transaction',
        headerName: 'Transaction ID',
        ...this.baseFields.transaction,
      },
      {
        field: 'pool',
        headerName: 'Pool',
        ...this.baseFields.pool,
      },
      {
        field: 'poolToken',
        ...this.baseFields.poolToken,
      },
      {
        field: 'token0Symbol',
        headerName: 'Token 0 Symbol',
        ...this.baseFields.string,
        filterable: false,
        sortable: false,
      },
      {
        field: 'token1Symbol',
        headerName: 'Token 1 Symbol',
        ...this.baseFields.string,
        filterable: false,
        sortable: false,
      },
      {
        field: 'timestamp',
        headerName: 'Timestamp',
        ...this.baseFields.timestamp,
      },
      {
        field: 'owner',
        headerName: 'Owner',
        ...this.baseFields.walletAddress,
      },
      {
        field: 'origin',
        headerName: 'Origin',
        ...this.baseFields.walletAddress,
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
}
