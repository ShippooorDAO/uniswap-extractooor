/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
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

export default class FlashesQuery extends ExtractooorQueryBase<Entity> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    tokenService: TokenService,
    uniswapPoolService: UniswapPoolService
  ) {
    super('Flashes', 'Flashes', apolloClient, tokenService, uniswapPoolService);
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
        ...this.baseFields.transactionId,
      },
      {
        field: 'transaction',
        headerName: 'Transaction ID',
        ...this.baseFields.transaction,
      },
      {
        field: 'timestamp',
        headerName: 'Timestamp',
        ...this.baseFields.timestamp,
      },
      {
        field: 'pool',
        headerName: 'Pool',
        ...this.baseFields.pool,
      },
      {
        field: 'token0',
        headerName: 'Token 0',
        ...this.baseFields.poolToken,
        sortable: false,
      },
      {
        field: 'token1',
        headerName: 'Token 1',
        ...this.baseFields.poolToken,
        sortable: false,
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
        field: 'sender',
        headerName: 'Sender',
        ...this.baseFields.walletAddress,
      },
      {
        field: 'recipient',
        headerName: 'Recipient',
        ...this.baseFields.walletAddress,
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
        field: 'amount0Paid',
        headerName: 'Amount 0 Paid',
        ...this.baseFields.amount,
      },
      {
        field: 'amount1Paid',
        headerName: 'Amount 1 Paid',
        ...this.baseFields.amount,
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
