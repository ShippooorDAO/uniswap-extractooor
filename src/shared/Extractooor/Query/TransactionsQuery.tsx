/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import { ReactNode } from 'react';
import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { ExtractooorQueryBase } from './QueryBase';
import { TokenService } from '@/shared/Currency/TokenService';

interface Response {
  transactions: {
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
  }[];
}

const QUERY = gql`
  {
    transactions {
      id
      blockNumber
      timestamp
      gasUsed
      gasPrice
    }
  }
`;

export default class TransactionsQuery extends ExtractooorQueryBase {
  private readonly baseColumns: GridColDef[] = [
    {
      field: 'blockNumber',
      headerName: 'Block Number',
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
      field: 'gasUsed',
      headerName: 'Gas Used',
      type: 'number',
      width: 150,
    },
    {
      field: 'gasPrice',
      headerName: 'Gas Price',
      type: 'number',
      width: 150,
    },
  ];

  constructor(
    private readonly apolloClient: ApolloClient<NormalizedCacheObject>
  ) {
    super('Transactions', 'Transactions');
  }

  private parseResponse(response: Response): GridRowsProp {
    return response.transactions.map((entry) => ({
      ...entry,
      gasUsed: Number(entry.gasUsed),
      gasPrice: Number(entry.gasPrice),
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
