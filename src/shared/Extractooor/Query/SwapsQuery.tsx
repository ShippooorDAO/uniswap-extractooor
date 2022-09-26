/* eslint-disable class-methods-use-this */

import { GridRowsProp } from '@mui/x-data-grid-pro';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { baseFields, ExtractooorQueryBase } from './QueryBase';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';
import { UsdAmount } from '@/shared/Currency/UsdAmount';

interface SwapEntity {
  id: string; // ID!
  transaction: {
    id: string; // ID!
  }; // Transaction!
  timestamp: string; // BigInt!
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
  sender: string; // Bytes!
  recipient: string; // Bytes!
  origin: string; // Bytes!
  amount0: string; // BigDecimal!
  amount1: string; // BigDecimal!
  amountUSD: string; // BigDecimal!
  sqrtPriceX96: string; // BigInt!
  tick: string; // BigInt!
  logIndex: string; // BigInt!
}
interface Response {
  swaps: SwapEntity[];
}

export default class SwapsQuery extends ExtractooorQueryBase<
  Response,
  SwapEntity
> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('Swaps', 'Swaps', apolloClient);
  }

  getColumns() {
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
        field: 'origin',
        headerName: 'Origin',
        ...baseFields.string,
      },
      {
        field: 'token0',
        headerName: 'Token 0 ID',
        ...baseFields.string,
      },
      {
        field: 'token0Symbol',
        headerName: 'Token 0 Symbol',
        ...baseFields.string,
        filterable: false,
        sortable: false,
      },
      {
        field: 'token1Symbol',
        headerName: 'Token 1 Symbol',
        ...baseFields.string,
        filterable: false,
        sortable: false,
      },
      {
        field: 'token1',
        headerName: 'Token 1 ID',
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
        field: 'sqrticeX96',
        headerName: 'SqrticeX96',
        ...baseFields.integer,
      },
      {
        field: 'tick',
        headerName: 'Tick',
        ...baseFields.integer,
      },
      {
        field: 'logIndex',
        headerName: 'Log Index',
        ...baseFields.integer,
      },
    ];
  }

  getQueryEntityName() {
    return 'swaps';
  }

  getQueryBody() {
    return `
      {
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
        sender
        recipient
        origin
        amount0
        amount1
        amountUSD
        sqrtPriceX96
        tick
        logIndex
      }
    `;
  }

  getRows(swaps: SwapEntity[]): GridRowsProp {
    return swaps.map((entry) => ({
      ...entry,
      timestamp: new Date(Number(entry.timestamp) * 1000),
      transaction: entry.transaction.id,
      pool: entry.pool.id,
      token0: entry.token0.id,
      token0Symbol: entry.token0.symbol,
      token1: entry.token1.id,
      token1Symbol: entry.token1.symbol,
      amount0: TokenAmount.fromBigDecimal(
        entry.amount0,
        this.tokenService.getById(entry.token0.id)!
      ),
      amount1: TokenAmount.fromBigDecimal(
        entry.amount1,
        this.tokenService.getById(entry.token1.id)!
      ),
      amountUSD: UsdAmount.fromBigDecimal(entry.amountUSD),
      sqrtPriceX96: Number(entry.sqrtPriceX96),
      tick: Number(entry.tick),
    }));
  }
}
