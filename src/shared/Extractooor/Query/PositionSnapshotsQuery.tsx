/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ExtractooorQueryBase } from './QueryBase';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';

interface Entity {
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
}

interface Response {
  positionSnapshots: Entity[];
}

export default class PositionSnapshotsQuery extends ExtractooorQueryBase<
  Response,
  Entity
> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    tokenService: TokenService
  ) {
    super(
      'Position Snapshots',
      'Position Snapshots',
      apolloClient,
      tokenService
    );
  }

  getQueryEntityName() {
    return 'positionSnapshots';
  }

  getQueryBody() {
    return `
    {
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
    }`;
  }

  getColumns(): GridColDef[] {
    return [
      {
        field: 'id',
        headerName: 'ID',
        ...this.baseFields.id,
      },
      {
        field: 'owner',
        headerName: 'Owner',
        ...this.baseFields.walletAddress,
      },
      {
        field: 'pool',
        headerName: 'Pool ID',
        ...this.baseFields.address,
      },
      {
        field: 'position',
        headerName: 'Position ID',
        ...this.baseFields.string,
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
        field: 'liquidity',
        headerName: 'Liquidity',
        ...this.baseFields.integer,
      },
      {
        field: 'depositedToken0',
        headerName: 'Deposited Token 0',
        ...this.baseFields.amount,
      },
      {
        field: 'depositedToken1',
        headerName: 'Deposited Token 1',
        ...this.baseFields.amount,
      },
      {
        field: 'withdrawnToken0',
        headerName: 'Withdrawn Token 0',
        ...this.baseFields.amount,
      },
      {
        field: 'withdrawnToken1',
        headerName: 'Withdrawn Token 1',
        ...this.baseFields.amount,
      },
      {
        field: 'collectedFeesToken0',
        headerName: 'Collected Fees Token 0',
        ...this.baseFields.amount,
      },
      {
        field: 'collectedFeesToken1',
        headerName: 'Collected Fees Token 1',
        ...this.baseFields.amount,
      },
      {
        field: 'transaction',
        headerName: 'Transaction',
        ...this.baseFields.transaction,
      },
      {
        field: 'feeGrowthInside0LastX128',
        headerName: 'Fee Growth Inside 0 Last X128',
        ...this.baseFields.integer,
      },
      {
        field: 'feeGrowthInside1LastX128',
        headerName: 'Fee Growth Inside 1 Last X128',
        ...this.baseFields.integer,
      },
    ];
  }

  getRows(response: Entity[]): GridRowsProp {
    return response.map((entry) => ({
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
}
