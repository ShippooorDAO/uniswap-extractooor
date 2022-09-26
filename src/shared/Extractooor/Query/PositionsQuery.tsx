/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { baseFields, ExtractooorQueryBase } from './QueryBase';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';

interface Entity {
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
}

interface Response {
  positions: Entity[];
}

export default class PositionsQuery extends ExtractooorQueryBase<
  Response,
  Entity
> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    tokenService: TokenService
  ) {
    super('Positions', 'Positions', apolloClient, tokenService);
  }

  getQueryEntityName() {
    return 'positions';
  }

  getQueryBody() {
    return `
    {
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
    }`;
  }

  getRows(response: Entity[]): GridRowsProp {
    return response.map((entry) => ({
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
        ...this.baseFields.string,
      },
      {
        field: 'pool',
        headerName: 'Pool ID',
        ...this.baseFields.string,
      },
      {
        field: 'token0',
        headerName: 'Token 0 ID',
        ...this.baseFields.string,
      },
      {
        field: 'token0Name',
        headerName: 'Token 0 Symbol',
        ...this.baseFields.string,
      },
      {
        field: 'token1',
        headerName: 'Token 1 ID',
        ...this.baseFields.string,
      },
      {
        field: 'token1Name',
        headerName: 'Token 1 Symbol',
        ...this.baseFields.string,
      },
      {
        field: 'tickLower',
        headerName: 'Tick Lower ID',
        ...this.baseFields.string,
      },
      {
        field: 'tickUpper',
        headerName: 'Tick Upper ID',
        ...this.baseFields.string,
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
        headerName: 'Transaction ID',
        ...this.baseFields.string,
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
}
