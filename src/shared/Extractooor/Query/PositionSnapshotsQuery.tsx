/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-premium';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ExtractooorQueryBase } from './QueryBase';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';
import { UniswapPoolService } from '@/shared/UniswapPool/UniswapPoolService';

interface Entity {
  id: string; // ID!
  owner: string; //  Bytes!
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

export default class PositionSnapshotsQuery extends ExtractooorQueryBase<Entity> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    tokenService: TokenService,
    uniswapPoolService: UniswapPoolService
  ) {
    super(
      'Position Snapshots',
      'Position Snapshots',
      apolloClient,
      tokenService,
      uniswapPoolService
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
      position {
        id
      }
      blockNumber
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
    return response.map((entry) => {
      const token0 = this.tokenService.getById(entry.pool.token0.id)!;
      const token1 = this.tokenService.getById(entry.pool.token1.id)!;
      return {
        ...entry,
        timestamp: new Date(Number(entry.timestamp) * 1000),
        pool: entry.pool.id,
        token0: entry.pool.token0.id,
        token0Symbol: entry.pool.token0.symbol,
        token1: entry.pool.token1.id,
        token1Symbol: entry.pool.token1.symbol,
        position: entry.position.id,
        liquidity: Number(entry.liquidity),
        depositedToken0: TokenAmount.fromBigDecimal(
          entry.depositedToken0,
          token0
        ),
        depositedToken1: TokenAmount.fromBigDecimal(
          entry.depositedToken1,
          token1
        ),
        withdrawnToken0: TokenAmount.fromBigDecimal(
          entry.withdrawnToken0,
          token0
        ),
        withdrawnToken1: TokenAmount.fromBigDecimal(
          entry.withdrawnToken1,
          token1
        ),
        collectedFeesToken0: TokenAmount.fromBigDecimal(
          entry.collectedFeesToken0,
          token0
        ),
        collectedFeesToken1: TokenAmount.fromBigDecimal(
          entry.collectedFeesToken1,
          token1
        ),
        transaction: entry.transaction.id,
        feeGrowthInside0LastX128: Number(entry.feeGrowthInside0LastX128),
        feeGrowthInside1LastX128: Number(entry.feeGrowthInside1LastX128),
      };
    });
  }
}
