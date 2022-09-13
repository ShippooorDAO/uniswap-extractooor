/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import { ReactNode } from 'react';
import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { ExtractooorQueryBase } from './QueryBase';
import { AmountFormatter } from '@/shared/Utils/DataGrid';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';

interface Response {
  positionSnapshots: {
    id: string; // ID!
    owner: string; //  Bytes!
    pool: {
      id: string; // ID!
      token0: {
        id: string; // ID!
      };
      token1: {
        id: string; // ID!
      };
    }; //  Pool!
    position: {
      id: string; // ID!
    }; // Position!
    blockNumber: string; // BigInt!
    timestamp: string; // BigInt!
    liquidity: string; // BigInt!
    depositedToken0: string; // BigDecimal!
    depositedToken1: string; // BigDecimal!
    withdrawnToken0: string; // BigDecimal!
    withdrawnToken1: string; // BigDecimal!
    collectedFeesToken0: string; // BigDecimal!
    collectedFeesToken1: string; // BigDecimal!
    transaction: {
      id: string; // ID!
    }; // Transaction!
    feeGrowthInside0LastX128: string; // BigInt!
    feeGrowthInside1LastX128: string; // BigInt!
  }[];
}

const QUERY = gql`
  {
    positionSnapshots {
      id
      owner
      pool {
        id
        token0 {
          id
        }
        token1 {
          id
        }
      }
      position {
        id
      }
      blockNumber
      timestamp
      liquidity
      depositedToken0
      depositedToken1
      withdrawnToken0
      withdrawnToken1
      collectedFeesToken0
      collectedFeesToken1
      transaction {
        id
      }
      feeGrowthInside0LastX128
      feeGrowthInside1LastX128
    }
  }
`;

export default class PositionSnapshotsQuery extends ExtractooorQueryBase {
  private readonly baseColumns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'owner',
      headerName: 'Owner',
      type: 'string',
      width: 150,
    },
    {
      field: 'pool',
      headerName: 'Pool ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'position',
      headerName: 'Position ID',
      type: 'string',
      width: 150,
    },
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
      field: 'date',
      headerName: 'Date',
      type: 'string',
      width: 150,
    },
    {
      field: 'liquidity',
      headerName: 'Liquidity',
      type: 'number',
      width: 150,
    },
    {
      field: 'depositedToken0',
      headerName: 'Deposited Token 0',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'depositedToken1',
      headerName: 'Deposited Token 1',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'withdrawnToken0',
      headerName: 'Withdrawn Token 0',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'withdrawnToken1',
      headerName: 'Withdrawn Token 1',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'collectedFeesToken0',
      headerName: 'Collected Fees Token 0',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'collectedFeesToken1',
      headerName: 'Collected Fees Token 1',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'transaction',
      headerName: 'Transaction',
      type: 'string',
      width: 150,
    },
    {
      field: 'feeGrowthInside0LastX128',
      headerName: 'Fee Growth Inside 0 Last X128',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'feeGrowthInside1LastX128',
      headerName: 'Fee Growth Inside 1 Last X128',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
  ];

  constructor(
    private readonly apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('Position Snapshots', 'Position Snapshots');
  }

  private parseResponse(response: Response): GridRowsProp {
    return response.positionSnapshots.map((entry) => ({
      ...entry,
      date: new Date(Number(entry.timestamp) * 1000),
      pool: entry.pool.id,
      position: entry.position.id,
      liquidity: Number(entry.liquidity),
      depositedToken0: TokenAmount.fromBigDecimal(
        entry.depositedToken0,
        this.tokenService.getById(entry.pool.token0.id)!
      ),
      depositedToken1: TokenAmount.fromBigDecimal(
        entry.depositedToken1,
        this.tokenService.getById(entry.pool.token1.id)!
      ),
      withdrawnToken0: TokenAmount.fromBigDecimal(
        entry.withdrawnToken0,
        this.tokenService.getById(entry.pool.token0.id)!
      ),
      withdrawnToken1: TokenAmount.fromBigDecimal(
        entry.withdrawnToken1,
        this.tokenService.getById(entry.pool.token1.id)!
      ),
      collectedFeesToken0: TokenAmount.fromBigDecimal(
        entry.collectedFeesToken0,
        this.tokenService.getById(entry.pool.token0.id)!
      ),
      collectedFeesToken1: TokenAmount.fromBigDecimal(
        entry.collectedFeesToken1,
        this.tokenService.getById(entry.pool.token1.id)!
      ),
      transaction: entry.transaction.id,
      feeGrowthInside0LastX128: TokenAmount.fromBigDecimal(
        entry.feeGrowthInside0LastX128,
        this.tokenService.getById(entry.pool.token0.id)!
      ),
      feeGrowthInside1LastX128: TokenAmount.fromBigDecimal(
        entry.feeGrowthInside1LastX128,
        this.tokenService.getById(entry.pool.token1.id)!
      ),
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
