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

export default class SwapsQuery extends ExtractooorQueryBase<Entity> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    tokenService: TokenService,
    uniswapPoolService: UniswapPoolService
  ) {
    super(
      'Collects',
      'Collects',
      apolloClient,
      tokenService,
      uniswapPoolService
    );
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
        ...this.baseFields.transactionId,
      },
      {
        field: 'transaction',
        headerName: 'Transaction ID',
        ...this.baseFields.address,
      },
      {
        field: 'timestamp',
        headerName: 'Timestamp',
        ...this.baseFields.timestamp,
      },
      {
        field: 'pool',
        headerName: 'Pool ID',
        ...this.baseFields.pool,
      },
      {
        field: 'owner',
        headerName: 'Owner',
        ...this.baseFields.walletAddress,
      },
      {
        field: 'poolTokens',
        ...this.baseFields.poolTokens,
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
