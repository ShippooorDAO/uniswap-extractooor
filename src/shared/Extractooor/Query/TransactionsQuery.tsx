/* eslint-disable class-methods-use-this */

import { GridRowsProp } from '@mui/x-data-grid-pro';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { baseFields, ExtractooorQueryBase } from './QueryBase';

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

interface Response {
  transactions: Entity[];
}

export default class TransactionsQuery extends ExtractooorQueryBase<
  Response,
  Entity
> {
  constructor(apolloClient: ApolloClient<NormalizedCacheObject>) {
    super('Transactions', 'Transactions', apolloClient);
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
        ...baseFields.id,
      },
      {
        field: 'blockNumber',
        headerName: 'Block Number',
        ...baseFields.integer,
      },
      {
        field: 'timestamp',
        headerName: 'Timestamp',
        ...baseFields.timestamp,
      },
      {
        field: 'gasUsed',
        headerName: 'Gas Used',
        ...baseFields.integer,
      },
      {
        field: 'gasPrice',
        headerName: 'Gas Price',
        ...baseFields.integer,
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
