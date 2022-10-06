/* eslint-disable class-methods-use-this */

import { GridRowsProp } from '@mui/x-data-grid-pro';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ExtractooorQueryBase } from './QueryBase';
import { TokenService } from '@/shared/Currency/TokenService';
import { UniswapPoolService } from '@/shared/UniswapPool/UniswapPoolService';

interface Entity {
  id: string; // ID!
  blockNumber: string; // BigInt!
  timestamp: string; // BigInt!
  gasUsed: string; // BigInt!
  gasPrice: string; // BigInt!

  // Skipped because these are repeated fields.
  // mints: {
  //   id: string; // ID!
  // }[]; // [Mint]!
  // burns: {
  //   id: string; // ID!
  // }[]; // [Burn]!
  // swaps: {
  //   id: string; // ID!
  // }[]; // [Swap]!
  // flashed: {
  //   id: string; // ID!
  // }[]; // [Flash]!
  // collects: {
  //   id: string; // ID!
  // }[];
}

export default class TransactionsQuery extends ExtractooorQueryBase<Entity> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    tokenService: TokenService,
    uniswapPoolService: UniswapPoolService
  ) {
    super(
      'Transactions',
      'Transactions',
      apolloClient,
      tokenService,
      uniswapPoolService
    );
  }

  getQueryEntityName() {
    return 'transactions';
  }

  getQueryBody() {
    return `{
      id
      blockNumber
      timestamp
      gasUsed
      gasPrice
    }`;
  }

  getColumns() {
    return [
      {
        field: 'id',
        headerName: 'ID',
        ...this.baseFields.transactionId,
      },
      {
        field: 'blockNumber',
        headerName: 'Block Number',
        ...this.baseFields.integer,
      },
      {
        field: 'timestamp',
        headerName: 'Timestamp',
        ...this.baseFields.timestamp,
      },
      {
        field: 'gasUsed',
        headerName: 'Gas Used',
        ...this.baseFields.integer,
      },
      {
        field: 'gasPrice',
        headerName: 'Gas Price',
        ...this.baseFields.integer,
      },
    ];
  }

  getRows(response: Entity[]): GridRowsProp {
    return response.map((entry) => ({
      ...entry,
      timestamp: new Date(Number(entry.timestamp) * 1000),
      gasUsed: Number(entry.gasUsed),
      gasPrice: Number(entry.gasPrice),
    }));
  }
}
