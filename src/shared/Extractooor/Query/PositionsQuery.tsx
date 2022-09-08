/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import { ReactNode } from 'react';
import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { ExtractooorQueryBase } from './QueryBase';
import { AmountFormatter } from '@/shared/Utils/DataGrid';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';

interface Response {
  positions: {
    id: string; // ID!
    owner: string; // Bytes!
    pool: {
      id: string; // ID!
    }; // Pool!
    token0: {
      id: string; // ID!
      name: string;
    }; // !Token
    token1: {
      id: string;
      name: string;
    }; // !Token
    tickLower: {
      id: string; // ID!
    }; // !Tick;
    tickUpper: {
      id: string; // ID!
    }; // !Tick;
    liquidity: string; // !BigInt;
    depositedToken0: string; // BigDecimal!
    depositedToken1: string; // BigDecimal!
    withdrawnToken0: string; // BigDecimal!
    withdrawnToken1: string; // BigDecimal!
    collectedFeesToken0: string; // BigDecimal!
    collectedFeesToken1: string; // BigDecimal!
    transaction: {
      id: string;
    }; // Transaction!
    feeGrowthInside0LastX128: string; // BigInt!
    feeGrowthInside1LastX128: string; // BigInt!
  }[];
}

const QUERY = gql`
  {
    positions {
      id
      owner
      pool {
        id
      }
      token0 {
        id
        name
      }
      token1 {
        id
        name
      }
      tickLower {
        id
      }
      tickUpper {
        id
      }
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

export default class PositionsQuery extends ExtractooorQueryBase {
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
      field: 'token0',
      headerName: 'Token 0 ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'token0Name',
      headerName: 'Token 0 Name',
      type: 'string',
      width: 150,
    },
    {
      field: 'token1',
      headerName: 'Token 1 ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'token1Name',
      headerName: 'Token 1 Name',
      type: 'string',
      width: 150,
    },
    {
      field: 'tickLower',
      headerName: 'Tick Lower ID',
      type: 'string',
      width: 150,
    },
    {
      field: 'tickUpper',
      headerName: 'Tick Upper ID',
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
      headerName: 'Transaction ID',
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
    super('Positions', 'Positions');
  }

  private parseResponse(response: Response): GridRowsProp {
    return response.positions.map((entry) => ({
      ...entry,

      // owner
      pool: entry.pool.id,
      token0: entry.token0.id,
      token0Name: entry.token0.name,
      token1: entry.token1.id,
      token1Name: entry.token1.name,
      tickLower: entry.tickLower.id,
      tickUpper: entry.tickUpper.id,
      liquidity: Number(entry.liquidity),
      depositedToken0: TokenAmount.fromBigDecimal(
        entry.depositedToken0,
        this.tokenService.getById(entry.token0.id)!
      ),
      depositedToken1: TokenAmount.fromBigDecimal(
        entry.depositedToken1,
        this.tokenService.getById(entry.token1.id)!
      ),
      withdrawnToken0: TokenAmount.fromBigDecimal(
        entry.withdrawnToken0,
        this.tokenService.getById(entry.token0.id)!
      ),
      withdrawnToken1: TokenAmount.fromBigDecimal(
        entry.withdrawnToken1,
        this.tokenService.getById(entry.token1.id)!
      ),
      collectedFeesToken0: TokenAmount.fromBigDecimal(
        entry.collectedFeesToken0,
        this.tokenService.getById(entry.token0.id)!
      ),
      collectedFeesToken1: TokenAmount.fromBigDecimal(
        entry.collectedFeesToken1,
        this.tokenService.getById(entry.token1.id)!
      ),
      transaction: entry.transaction.id,
      feeGrowthInside0LastX128: TokenAmount.fromBigDecimal(
        entry.feeGrowthInside0LastX128,
        this.tokenService.getById(entry.token0.id)!
      ),
      feeGrowthInside1LastX128: TokenAmount.fromBigDecimal(
        entry.feeGrowthInside1LastX128,
        this.tokenService.getById(entry.token1.id)!
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
