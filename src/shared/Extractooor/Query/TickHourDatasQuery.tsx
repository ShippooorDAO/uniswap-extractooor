/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-premium';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ExtractooorQueryBase } from './QueryBase';
import { UsdAmount } from '@/shared/Currency/UsdAmount';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';
import { UniswapPoolService } from '@/shared/UniswapPool/UniswapPoolService';

interface Entity {
  id: string; // ID!
  periodStartUnix: string; // Int!
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
  }; // Pool!
  tick: {
    id: string; // ID!
  }; // Tick!
  liquidityGross: string; // BigInt!
  liquidityNet: string; // BigInt!
  volumeToken0: string; // BigDecimal!
  volumeToken1: string; // BigDecimal!
  volumeUSD: string; // BigDecimal!
  feesUSD: string; // BigDecimal!
}

export default class TickHourDatasQuery extends ExtractooorQueryBase<Entity> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    tokenService: TokenService,
    uniswapPoolService: UniswapPoolService
  ) {
    super(
      'Tick Hour Data',
      'Tick Hour Data',
      apolloClient,
      tokenService,
      uniswapPoolService
    );
  }

  getQueryEntityName() {
    return 'tickHourDatas';
  }

  getQueryBody() {
    return `{
      id
      periodStartUnix
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
      tick {
        id
      }
      liquidityGross
      liquidityNet
      volumeToken0
      volumeToken1
      volumeUSD
      feesUSD
    }`;
  }

  getRows(response: Entity[]): GridRowsProp {
    return response.map((entry) => ({
      ...entry,
      periodStartUnix: new Date(Number(entry.periodStartUnix) * 1000),
      pool: entry.pool.id,
      token0: entry.pool.token0.id,
      token0Symbol: entry.pool.token0.symbol,
      token1: entry.pool.token1.id,
      token1Symbol: entry.pool.token1.symbol,
      tick: entry.tick.id,
      liquidityGross: Number(entry.liquidityGross),
      liquidityNet: Number(entry.liquidityNet),
      volumeToken0: TokenAmount.fromBigDecimal(
        entry.volumeToken0,
        this.tokenService.getById(entry.pool.token0.id)!
      ),
      volumeToken1: TokenAmount.fromBigDecimal(
        entry.volumeToken1,
        this.tokenService.getById(entry.pool.token1.id)!
      ),
      volumeUSD: UsdAmount.fromBigDecimal(entry.volumeUSD),
      feesUSD: UsdAmount.fromBigDecimal(entry.feesUSD),
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
        field: 'periodStartUnix',
        headerName: 'Period Start',
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
        field: 'tick',
        headerName: 'Tick',
        ...this.baseFields.integer,
      },
      {
        field: 'liquidityGross',
        headerName: 'Liquidity Gross',
        ...this.baseFields.integer,
      },
      {
        field: 'liquidityNet',
        headerName: 'Liquidity Net',
        ...this.baseFields.integer,
      },
      {
        field: 'volumeToken0',
        headerName: 'Volume Token 0',
        ...this.baseFields.amount,
      },
      {
        field: 'volumeToken1',
        headerName: 'Volume Token 1',
        ...this.baseFields.amount,
      },
      {
        field: 'volumeUSD',
        headerName: 'Volume USD',
        ...this.baseFields.amount,
      },
      {
        field: 'feesUSD',
        headerName: 'Fees USD',
        ...this.baseFields.amount,
      },
    ];
  }
}
